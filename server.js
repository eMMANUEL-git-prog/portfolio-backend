require("dotenv").config({ path: __dirname + "/.env" }); // load first!!
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
// const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const contactRoutes = require("./routes/contact");

// Force .env load from backend folder
const envPath = path.resolve(__dirname, ".env");
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error("❌ Failed to load .env file from:", envPath);
} else {
  console.log("✅ Loaded .env file from:", envPath);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Debug: confirm environment variables are loaded
console.log("Loaded EMAIL_HOST:", process.env.EMAIL_HOST);
console.log("Loaded DATABASE_URL:", process.env.DATABASE_URL ? "✅" : "❌");

console.log("DEBUG ENV RAW:", process.env);

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("Error connecting to PostgreSQL:", err);
  } else {
    console.log("PostgreSQL connected successfully");
    release();
  }
});

// Make pool available to routes
app.locals.db = pool;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/contact", contactRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
