const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

const createAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      ["emmanuel19727@gmail.com"]
    );

    if (existingAdmin.rows.length > 0) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    // Create admin user
    const result = await pool.query(
      "INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role",
      ["emmanuel19727@gmail.com", hashedPassword, "admin"]
    );

    console.log("Admin user created successfully");
    console.log("Email: emmanuel19727@gmail.com");
    console.log("Password: admin123");
    console.log("Please change the password after first login");

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
