const express = require("express");

const {
  getDashboard,
  addUser,
  getUsers,
  getStores,
  getUserDetails
} = require("../controllers/adminController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Dashboard
router.get(
  "/dashboard",
  authenticateToken,
  authorizeRoles("ADMIN"),
  getDashboard
);

// Create user/admin/store owner
router.post(
  "/users",
  authenticateToken,
  authorizeRoles("ADMIN"),
  addUser
);

// List users + filters
router.get(
  "/users",
  authenticateToken,
  authorizeRoles("ADMIN"),
  getUsers
);

// List stores + filters
router.get(
  "/stores",
  authenticateToken,
  authorizeRoles("ADMIN"),
  getStores
);

// User details
router.get(
  "/users/:id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  getUserDetails
);

module.exports = router;