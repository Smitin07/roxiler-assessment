const pool = require("../config/database");

// Get all stores + search + user's rating
const getStores = async (req, res) => {
  try {
    const { name, address } = req.query;
    const userId = req.user.id;

    let query = `
      SELECT
        s.id,
        s.name,
        s.email,
        s.address,
        COALESCE(ROUND(AVG(all_ratings.rating), 2), 0) AS rating,
        MAX(my_rating.id) AS rating_id,
        MAX(my_rating.rating) AS user_rating
      FROM stores s

      LEFT JOIN ratings all_ratings
        ON s.id = all_ratings.store_id

      LEFT JOIN ratings my_rating
        ON s.id = my_rating.store_id
        AND my_rating.user_id = $1

      WHERE 1=1
    `;

    const values = [userId];

    if (name) {
      values.push(`%${name}%`);
      query += ` AND s.name ILIKE $${values.length}`;
    }

    if (address) {
      values.push(`%${address}%`);
      query += ` AND s.address ILIKE $${values.length}`;
    }

    query += `
      GROUP BY s.id
      ORDER BY s.name ASC
    `;

    const result = await pool.query(query, values);

    res.json(result.rows);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch stores"
    });
  }
};


// Add a new store - ADMIN only
const addStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    if (!name || !email || !address) {
      return res.status(400).json({
        message: "Name, email and address are required"
      });
    }

    const result = await pool.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, address, owner_id`,
      [name, email, address, owner_id || null]
    );

    res.status(201).json({
      message: "Store added successfully",
      store: result.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to add store"
    });
  }
};


module.exports = {
  getStores,
  addStore
};