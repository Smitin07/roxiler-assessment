const express = require("express");

const {
  getOwnerDashboard
} = require("../controllers/ownerController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/dashboard",
  authenticateToken,
  authorizeRoles("STORE_OWNER"),
  getOwnerDashboard
);

module.exports = router;