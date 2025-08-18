const express = require("express");
const auth = require("../middleware/auth");
const emailService = require("../services/emailService");

const router = express.Router();

// Submit contact form (public)
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const db = req.app.locals.db;

    // Validate input
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const result = await db.query(
      "INSERT INTO contacts (name, email, subject, message) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, subject, message]
    );

    // Send email notification
    try {
      await emailService.sendContactNotification({
        name,
        email,
        subject,
        message,
      });

      // Send auto-reply to user
      await emailService.sendAutoReply({
        name,
        email,
        subject,
      });
    } catch (emailError) {
      console.error("Email notification failed:", emailError);
      // Don't fail the request if email fails, just log it
    }

    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all contact messages (admin only)
router.get("/", auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query(
      "SELECT * FROM contacts ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Get contacts error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update contact status (admin only)
router.put("/:id", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const db = req.app.locals.db;

    const result = await db.query(
      "UPDATE contacts SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update contact error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
