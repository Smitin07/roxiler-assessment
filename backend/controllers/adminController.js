const pool = require("../config/database");
const bcrypt = require("bcrypt");

// ==================== ADMIN DASHBOARD ====================

const getDashboard = async (req, res) => {
  try {
    const users = await pool.query("SELECT COUNT(*) FROM users");
    const stores = await pool.query("SELECT COUNT(*) FROM stores");
    const ratings = await pool.query("SELECT COUNT(*) FROM ratings");

    res.json({
      totalUsers: Number(users.rows[0].count),
      totalStores: Number(stores.rows[0].count),
      totalRatings: Number(ratings.rows[0].count)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to load dashboard"
    });
  }
};


// ==================== ADD USER ====================

const addUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    if (!name || !email || !password || !address || !role) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (!["USER", "ADMIN", "STORE_OWNER"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role"
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users
       (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, address, role`,
      [name, email, hashedPassword, address, role]
    );

    res.status(201).json({
      message: "User created successfully",
      user: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create user"
    });
  }
};


// ==================== GET USERS ====================

const getUsers = async (req, res) => {
  try {
    const { name, email, address, role } = req.query;

    let query = `
      SELECT id, name, email, address, role
      FROM users
      WHERE 1=1
    `;

    const values = [];

    if (name) {
      values.push(`%${name}%`);
      query += ` AND name ILIKE $${values.length}`;
    }

    if (email) {
      values.push(`%${email}%`);
      query += ` AND email ILIKE $${values.length}`;
    }

    if (address) {
      values.push(`%${address}%`);
      query += ` AND address ILIKE $${values.length}`;
    }

    if (role) {
      values.push(role);
      query += ` AND role = $${values.length}`;
    }

    query += " ORDER BY name ASC";

    const result = await pool.query(query, values);

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch users"
    });
  }
};


// ==================== GET STORES ====================

const getStores = async (req, res) => {
  try {
    const { name, email, address } = req.query;

    let query = `
      SELECT
        s.id,
        s.name,
        s.email,
        s.address,
        COALESCE(ROUND(AVG(r.rating), 2), 0) AS rating
      FROM stores s
      LEFT JOIN ratings r
        ON s.id = r.store_id
      WHERE 1=1
    `;

    const values = [];

    if (name) {
      values.push(`%${name}%`);
      query += ` AND s.name ILIKE $${values.length}`;
    }

    if (email) {
      values.push(`%${email}%`);
      query += ` AND s.email ILIKE $${values.length}`;
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


// ==================== USER DETAILS ====================

const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, name, email, address, role
       FROM users
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch user"
    });
  }
};


// ==================== EXPORT ====================

module.exports = {
  getDashboard,
  addUser,
  getUsers,
  getStores,
  getUserDetails
};