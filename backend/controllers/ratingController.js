const pool = require("../config/database");

// Add or submit a rating
const addRating = async (req, res) => {
  try {
    const { store_id, rating } = req.body;
    const user_id = req.user.id;

    if (!store_id || !rating) {
      return res.status(400).json({
        message: "Store ID and rating are required"
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5"
      });
    }

    // Check if store exists
    const store = await pool.query(
      "SELECT id FROM stores WHERE id = $1",
      [store_id]
    );

    if (store.rows.length === 0) {
      return res.status(404).json({
        message: "Store not found"
      });
    }

    // Check if user has already rated this store
    const existingRating = await pool.query(
      "SELECT id FROM ratings WHERE user_id = $1 AND store_id = $2",
      [user_id, store_id]
    );

    if (existingRating.rows.length > 0) {
      return res.status(400).json({
        message: "You have already rated this store. Use update instead."
      });
    }

    const result = await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, store_id, rating`,
      [user_id, store_id, rating]
    );

    res.status(201).json({
      message: "Rating submitted successfully",
      rating: result.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to submit rating"
    });
  }
};


// Update an existing rating
const updateRating = async (req, res) => {
  try {
    const { rating } = req.body;
    const ratingId = req.params.id;
    const user_id = req.user.id;

    if (!rating) {
      return res.status(400).json({
        message: "Rating is required"
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5"
      });
    }

    const result = await pool.query(
      `UPDATE ratings
       SET rating = $1
       WHERE id = $2 AND user_id = $3
       RETURNING id, user_id, store_id, rating`,
      [rating, ratingId, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Rating not found or you are not allowed to update it"
      });
    }

    res.json({
      message: "Rating updated successfully",
      rating: result.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update rating"
    });
  }
};

module.exports = {
  addRating,
  updateRating
};