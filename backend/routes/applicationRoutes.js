const express = require("express");
const { Job, Application } = require("../models");
const {
  authenticateUser,
  isApplicant,
} = require("../middlewares/authMiddleware");

const router = express.Router();

//Get all jobs (Applicants can see all jobs posted by companies)
router.get("/jobs", authenticateUser, isApplicant, async (req, res) => {
  try {
    const jobs = await Job.findAll();
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

//Apply for a job (Applicants can apply using job ID)
router.post(
  "/apply/:jobId",
  authenticateUser,
  isApplicant,
  async (req, res) => {
    try {
      const job = await Job.findByPk(req.params.jobId);
      if (!job) return res.status(404).json({ message: "Job not found" });

      const application = await Application.create({
        jobId: job.id,
        applicantId: req.user.id,
      });

      res
        .status(201)
        .json({ message: "Application submitted successfully", application });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

//Get all applications of logged-in applicant
router.get("/", authenticateUser, isApplicant, async (req, res) => {
  try {
    const applications = await Application.findAll({
      where: { applicantId: req.user.id },
      include: [{ model: Job, attributes: ["title", "description"] }],
    });
    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

//Get a single application by ID
router.get("/:id", authenticateUser, isApplicant, async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id, {
      include: [{ model: Job, attributes: ["title", "description"] }],
    });
    if (!application)
      return res.status(404).json({ message: "Application not found" });

    res.json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
