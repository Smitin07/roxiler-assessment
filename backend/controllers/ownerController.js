const pool = require("../config/database");

// Store Owner Dashboard
const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Find stores owned by this user
    const stores = await pool.query(
      `SELECT id, name, email, address
       FROM stores
       WHERE owner_id = $1`,
      [ownerId]
    );

    if (stores.rows.length === 0) {
      return res.status(404).json({
        message: "No store found for this owner"
      });
    }

    const store = stores.rows[0];

    // Average rating
    const average = await pool.query(
      `SELECT COALESCE(ROUND(AVG(rating), 2), 0) AS average_rating
       FROM ratings
       WHERE store_id = $1`,
      [store.id]
    );

    // Users who rated the store
    const users = await pool.query(
      `SELECT
         u.id,
         u.name,
         u.email,
         r.rating
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = $1
       ORDER BY u.name ASC`,
      [store.id]
    );

    res.json({
      store: store,
      averageRating: Number(average.rows[0].average_rating),
      usersWhoRated: users.rows
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load owner dashboard"
    });
  }
};

module.exports = {
  getOwnerDashboard
};