const express = require('express');
const { authenticate } = require('../middleware/auth');
const CandidateAssessment = require('../models/CandidateAssessment');
const Certificate = require('../models/Certificate');
const Submission = require('../models/Submission');

const router = express.Router();

/**
 * GET /performance
 * Aggregates candidate statistics for the AI dashboard
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const candidateId = req.user.id;

    // 1. Get Assessments count & average accuracy
    const assessments = await CandidateAssessment.find({
      candidate_id: candidateId,
      status: 'COMPLETED'
    });

    const testsCompleted = assessments.length;
    let avgAccuracy = 0;
    if (testsCompleted > 0) {
      const totalScore = assessments.reduce((acc, curr) => acc + (curr.raw_score || 0), 0);
      avgAccuracy = Math.round(totalScore / testsCompleted);
    }

    // 2. Get Verified Certificates count
    const certsCount = await Certificate.countDocuments({
      candidate_id: candidateId,
      status: 'VERIFIED'
    });

    // 3. Get Code Submissions (Real-time from unified DB)
    const codeSubmissions = await Submission.countDocuments({
      userId: candidateId
    }); 

    res.json({
      testsCompleted,
      avgAccuracy,
      certsVerified: certsCount,
      codeSubmissions,
      lastUpdated: new Date()
    });
  } catch (err) {
    console.error('Performance aggregation error:', err);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
});

module.exports = router;
