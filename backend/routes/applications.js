const express = require('express');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { authenticate, candidateOnly, recruiterOnly } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/applications/my - Candidate views their own applications
 */
router.get('/my', authenticate, candidateOnly, async (req, res) => {
  try {
    const applications = await Application.find({ candidate_id: req.user.id })
      .populate('job_id', 'title location salary_range')
      .sort({ applied_at: -1 });

    res.json(applications);
  } catch (err) {
    console.error('Fetch my applications error:', err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

/**
 * GET /api/applications/job/:jobId - Recruiter views applications for a job
 */
router.get('/job/:jobId', authenticate, recruiterOnly, async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Verify recruiter owns the job
    const job = await Job.findOne({ _id: jobId, recruiter_id: req.user.id });
    if (!job) return res.status(404).json({ error: 'Job not found or unauthorized' });

    const applications = await Application.find({ job_id: jobId })
      .populate('candidate_id', 'fullName email skills')
      .sort({ overall_score: -1 });

    res.json(applications);
  } catch (err) {
    console.error('Fetch job applications error:', err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

module.exports = router;
