const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  techStack: { type: [String], default: [] },
  challenges: { type: [String], default: [] },
  recruiterEmail: { type: String },
  companyName: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Job", jobSchema);
