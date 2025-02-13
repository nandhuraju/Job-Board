const express = require("express");
const { Job } = require("../models");
const {
  authenticateUser,
  isCompany,
} = require("../middlewares/authMiddleware");

const router = express.Router();

// Create a job (Only Companies can do this)
router.post("/", authenticateUser, isCompany, async (req, res) => {
  try {
    const { title, description } = req.body;
    const job = await Job.create({
      title,
      description,
      companyId: req.user.id,
    });
    res.status(201).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.findAll();
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get job by ID
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update job (Only Companies can update their jobs)
router.put("/:id", authenticateUser, isCompany, async (req, res) => {
  try {
    const { title, description } = req.body;
    const job = await Job.findByPk(req.params.id);
    if (!job || job.companyId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only update your own job postings." });
    }

    await job.update({ title, description });
    res.json({ message: "Job updated successfully", job });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete job (Only Companies can delete their jobs)
router.delete("/:id", authenticateUser, isCompany, async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job || job.companyId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only delete your own job postings." });
    }

    await job.destroy();
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
