const express = require("express");

const {
  addRating,
  updateRating
} = require("../controllers/ratingController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/ratings:
 *   post:
 *     summary: Submit a rating
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Rating submitted successfully
 */
router.post(
  "/",
  authenticateToken,
  addRating
);


/**
 * @swagger
 * /api/ratings/{id}:
 *   put:
 *     summary: Update a rating
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Rating updated successfully
 */
router.put(
  "/:id",
  authenticateToken,
  updateRating
);

module.exports = router;