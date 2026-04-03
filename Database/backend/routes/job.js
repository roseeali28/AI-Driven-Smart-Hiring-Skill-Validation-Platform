const express = require("express");
const Job = require("../models/job");

const router = express.Router();

/* ===================== GET ALL JOBS ===================== */
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching jobs" });
  }
});

/* ===================== POST A NEW JOB ===================== */
router.post("/", async (req, res) => {
  try {
    const { title, description, techStack, challenges, recruiterEmail, companyName } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Job title is required" });
    }

    const job = new Job({
      title,
      description: description || "",
      techStack: Array.isArray(techStack) ? techStack : (techStack ? techStack.split(",").map(s => s.trim()) : []),
      challenges: Array.isArray(challenges) ? challenges : [],
      recruiterEmail: recruiterEmail || "",
      companyName: companyName || ""
    });

    await job.save();
    res.status(201).json({ message: "Job posted successfully", job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error posting job" });
  }
});

/* ===================== GET JOB BY ID ===================== */
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching job" });
  }
});

/* ===================== DELETE JOB ===================== */
router.delete("/:id", async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting job" });
  }
});

module.exports = router;
