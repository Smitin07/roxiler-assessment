const express = require("express");

const {
  getStores,
  addStore
} = require("../controllers/storeController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/stores:
 *   get:
 *     summary: Get stores
 *     tags: [Stores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *       - in: query
 *         name: address
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of stores
 */
router.get(
  "/",
  authenticateToken,
  getStores
);


/**
 * @swagger
 * /api/stores:
 *   post:
 *     summary: Add a store
 *     tags: [Stores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Store added successfully
 */
router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN"),
  addStore
);

module.exports = router;