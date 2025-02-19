const express = require("express");
const { Job, Application, User } = require("../models");
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
      companyId: req.user.id, // Use the authenticated company's ID
    });
    res.status(201).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get jobs created by the logged-in company (Only Companies can view their own jobs)
router.get("/", authenticateUser, isCompany, async (req, res) => {
  try {
    const jobs = await Job.findAll({
      where: { companyId: req.user.id }, // Filter jobs by the companyId of the logged-in user
    });
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get job by ID (Anyone can view job details)
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

// Get all applications for a specific job (Only the company that posted the job can view them)
router.get(
  "/:id/applications",
  authenticateUser,
  isCompany,
  async (req, res) => {
    try {
      const job = await Job.findByPk(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Ensure the logged-in company is the owner of the job
      if (job.companyId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized action" });
      }

      // Get all applications for the job, including applicant details
      const applications = await Application.findAll({
        where: { jobId: req.params.id },
        include: [
          { model: User, attributes: ["id", "name", "email"] }, // Include user details
        ],
      });

      if (applications.length === 0) {
        return res.status(404).json({ message: "No applications found" });
      }

      res.json(applications);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.delete("/:id", authenticateUser, isCompany, async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.companyId.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only delete your own job postings." });
    }

    // First, delete all applications associated with this job
    await Application.destroy({ where: { jobId: req.params.id } });

    // Then delete the job
    await job.destroy();
    res.json({
      message: "Job and associated applications deleted successfully",
    });
  } catch (error) {
    console.error("Delete Job Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
