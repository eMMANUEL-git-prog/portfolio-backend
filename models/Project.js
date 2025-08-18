const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    technologies: [{ type: String, required: true }],
    githubUrl: { type: String },
    liveUrl: { type: String },

    // 🔥 New Fields
    stack: {
      type: String,
      enum: ["Frontend", "Backend", "FullStack"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Planned", "In Progress", "Completed", "On Hold"],
      default: "Planned",
    },
    client: { type: String, default: "Personal" }, // If freelance / client project
    category: {
      type: String,
      enum: ["Web App", "Mobile App", "Ecommerce", "Portfolio", "API", "Other"],
      default: "Web App",
    },
    deadline: { type: Date }, // optional
    budget: { type: Number }, // optional, if for client work
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
