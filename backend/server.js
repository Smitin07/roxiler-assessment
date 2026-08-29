const express = require("express");
const cors = require("cors");
const pool = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const authenticateToken = require("./middleware/authMiddleware");
const storeRoutes = require("./routes/storeRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const adminRoutes = require("./routes/adminRoutes");
const ownerRoutes = require("./routes/ownerRoutes");


const app = express();

const PORT = 3000;


// Middleware
app.use(cors());
app.use(express.json());


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/owner", ownerRoutes);



// Authentication routes
app.use("/api/auth", authRoutes);

// Test backend
app.get("/", (req, res) => {
  res.json({
    message: "Roxiler Assessment Backend is running!"
  });
});

// Test database connection
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "Database connected successfully!",
      time: result.rows[0].now
    });
  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({
      message: "Database connection failed",
      error: error.message
    });
  }
});


app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({
    message: "You accessed a protected route!",
    user: req.user
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});