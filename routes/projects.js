const express = require("express");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all projects (public)
router.get("/", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query(
      "SELECT * FROM projects ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single project (public)
router.get("/:id", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query("SELECT * FROM projects WHERE id = $1", [
      req.params.id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create project (admin only)
router.post("/", auth, async (req, res) => {
  try {
    const {
      title,
      description,
      image,
      technologies,
      githubUrl,
      liveUrl,
      featured,
      stack,
      status,
    } = req.body;
    const db = req.app.locals.db;

    const result = await db.query(
      `INSERT INTO projects (title, description, image, technologies, github_url, live_url, featured, stack, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        title,
        description,
        image,
        technologies,
        githubUrl,
        liveUrl,
        featured || false,
        stack,
        status,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update project (admin only)
router.put("/:id", auth, async (req, res) => {
  try {
    const {
      title,
      description,
      image,
      technologies,
      githubUrl,
      liveUrl,
      featured,
      stack,
      status,
    } = req.body;
    const db = req.app.locals.db;

    const result = await db.query(
      `UPDATE projects 
       SET title = $1, description = $2, image = $3, technologies = $4, 
           github_url = $5, live_url = $6, featured = $7, 
           stack = $8, status = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 
       RETURNING *`,
      [
        title,
        description,
        image,
        technologies,
        githubUrl,
        liveUrl,
        featured || false,
        stack,
        status,
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete project (admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query(
      "DELETE FROM projects WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
