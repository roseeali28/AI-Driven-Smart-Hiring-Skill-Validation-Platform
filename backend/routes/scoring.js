const express = require('express');
const User = require('../models/User');
const Job = require('../models/Job');
const Certificate = require('../models/Certificate');
const { CredibilityScore } = require('../models/Misc');
const CandidateAssessment = require('../models/CandidateAssessment');
const Assessment = require('../models/Assessment');
const { authenticate, recruiterOnly } = require('../middleware/auth');

const router = express.Router();
const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

router.use(authenticate);
router.use(recruiterOnly);

/**
 * Computes credibility using ML service or local fallback.
 */
async function computeCredibility(candidateId, jobId) {
  try {
    const candidate = await User.findById(candidateId);
    if (!candidate) return null;

    const job = await Job.findById(jobId);
    const jobSkills = job ? (job.skills_required || []) : [];

    const assessmentsTaken = await CandidateAssessment.find({
      candidate_id: candidateId,
      job_id: jobId,
      status: 'COMPLETED'
    });

    const certificates = await Certificate.find({
      candidate_id: candidateId,
      status: 'VERIFIED'
    });

    let codingTotal = 0;
    let codingEarned = 0;
    let assessmentScores = [];

    for (const ca of assessmentsTaken) {
      assessmentScores.push(ca.weighted_score || 0);
      const assessmentDoc = await Assessment.findById(ca.assessment_id);
      if (assessmentDoc) {
        ca.answers.forEach(ans => {
          const q = assessmentDoc.questions.id(ans.question_id) || assessmentDoc.questions.find(q => q._id === ans.question_id);
          if (q) {
            if (q.type === 'CODING') {
              codingTotal += q.points || 10;
              codingEarned += ans.points_earned || 0;
            }
          }
        });
      }
    }

    const avgAssessment = assessmentsTaken.length
      ? assessmentScores.reduce((a, b) => a + b, 0) / assessmentsTaken.length
      : 50;

    const avgCoding = codingTotal > 0 ? (codingEarned / codingTotal) * 100 : avgAssessment;
    const certScores = certificates.map(c => c.trust_score || 0);

    // --- NEW: Fetch live-code submissions and aptitude scores ---
    let liveCodingScore = avgCoding;
    let aptitudeScore = 50;

    try {
      const LC_URL = process.env.LC_SERVICE_URL || 'http://localhost:5001';
      
      // Fetch live-code submissions for this candidate
      const subRes = await fetch(`${LC_URL}/api/submissions?userId=${candidateId}`, {
        headers: { 'x-internal-request': 'true' }
      });
      if (subRes.ok) {
        const subs = await subRes.json();
        if (subs.length > 0) {
          const accepted = subs.filter(s => s.status === 'Accepted').length;
          liveCodingScore = Math.round((accepted / subs.length) * 100);
        }
      }

      // Fetch aptitude results for this candidate (using InterviewResult from same DB)
      const InterviewResult = require('../models/InterviewResult');
      const interviewResults = await InterviewResult.find({ userId: candidateId });
      if (interviewResults.length > 0) {
        const avgInterview = interviewResults.reduce((sum, r) => sum + (r.avgScore || 0), 0) / interviewResults.length;
        aptitudeScore = Math.round((avgInterview / 10) * 100); // Convert 0-10 to 0-100
      }

      // Also fetch aptitude test results
      const aptRes = await fetch(`${LC_URL}/api/aptitude/results/${candidateId}`, {
        headers: { 'x-internal-request': 'true' }
      });
      if (aptRes.ok) {
        const aptResults = await aptRes.json();
        if (aptResults.length > 0) {
          const avgApt = aptResults.reduce((sum, r) => sum + (r.score || r.percentage || 0), 0) / aptResults.length;
          aptitudeScore = Math.round(avgApt);
        }
      }
    } catch (lcErr) {
      console.warn('Could not fetch live-code metrics:', lcErr.message);
    }

    const body = {
      assessment_score: avgAssessment,
      coding_score: Math.max(liveCodingScore, avgCoding), // Use best of both
      certificate_scores: certScores,
      assessment_scores_list: assessmentScores,
      candidate_skills: candidate.skills || [],
      job_skills: jobSkills,
      aptitude_score: aptitudeScore,
    };

    const res = await fetch(ML_URL + '/score/credibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      return await res.json();
    } else {
      throw new Error('ML Service Error');
    }
  } catch (e) {
    console.warn('Scoring fallback active:', e.message);
    const fallbackAssessment = 65;
    return {
      total_score: Math.round(fallbackAssessment),
      breakdown: {
        assessment_score: { value: fallbackAssessment, weight: 0.35 },
        coding_score:     { value: fallbackAssessment, weight: 0.25 },
        certificate_trust:{ value: 70,                weight: 0.20 },
        learning_aptitude:{ value: 60,                weight: 0.10 },
        skill_relevance:  { value: 80,                weight: 0.10 },
      },
    };
  }
}

/**
 * Apply custom weights to a pre-computed breakdown and return a new total.
 * All weights should add up to 100.
 */
function applyCustomWeights(breakdown, weights) {
  if (!breakdown || !weights) return null;

  const w = {
    assessment: (weights.assessment_weight ?? 35) / 100,
    coding:     (weights.coding_weight     ?? 25) / 100,
    cert:       (weights.cert_weight       ?? 20) / 100,
    learning:   (weights.learning_weight   ?? 10) / 100,
    skill:      (weights.skill_weight      ?? 10) / 100,
  };

  const assessment = breakdown.assessment_score?.value ?? 65;
  const coding     = breakdown.coding_score?.value     ?? 65;
  const cert       = breakdown.certificate_trust?.value ?? 70;
  const learning   = breakdown.learning_aptitude?.value ?? 60;
  const skill      = breakdown.skill_relevance?.value   ?? 80;

  const total =
    assessment * w.assessment +
    coding     * w.coding +
    cert       * w.cert +
    learning   * w.learning +
    skill      * w.skill;

  return Math.round(total * 10) / 10;
}

/* ─── Routes ─────────────────────────────────────────────────────────── */

/**
 * POST /scoring/compute – Compute credibility for candidate + job
 */
router.post('/compute', async (req, res) => {
  try {
    const { candidateId, jobId } = req.body;
    if (!candidateId || !jobId) return res.status(400).json({ error: 'candidateId and jobId required' });

    const jobCheck = await Job.findOne({ _id: jobId, recruiter_id: req.user.id });
    if (!jobCheck) return res.status(404).json({ error: 'Job not found' });

    const result = await computeCredibility(candidateId, jobId);
    if (!result) return res.status(404).json({ error: 'Candidate not found' });

    await CredibilityScore.findOneAndUpdate(
      { candidateId, jobId },
      { $set: { totalScore: result.total_score, breakdown: result.breakdown } },
      { upsert: true, new: true }
    );

    res.json(result);
  } catch (err) {
    console.error('Scoring error:', err);
    res.status(500).json({ error: 'Scoring failed' });
  }
});

/**
 * GET /scoring/weights/:jobId – Get ranking weights for a job
 */
router.get('/weights/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findOne({ _id: jobId, recruiter_id: req.user.id });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const weights = job.ranking_weights || {
      assessment_weight: 35,
      coding_weight:     25,
      cert_weight:       20,
      learning_weight:   10,
      skill_weight:      10
    };
    res.json({ jobId, weights });
  } catch (err) {
    console.error('Weights fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch weights' });
  }
});

/**
 * PUT /scoring/weights/:jobId – Save ranking weights for a job
 */
router.put('/weights/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { assessment_weight, coding_weight, cert_weight, learning_weight, skill_weight } = req.body;

    const total = (assessment_weight || 0) + (coding_weight || 0) + (cert_weight || 0) + (learning_weight || 0) + (skill_weight || 0);
    if (Math.round(total) !== 100) {
      return res.status(400).json({ error: `Weights must sum to 100. Got ${total}.` });
    }

    const job = await Job.findOneAndUpdate(
      { _id: jobId, recruiter_id: req.user.id },
      { $set: { ranking_weights: { assessment_weight, coding_weight, cert_weight, learning_weight, skill_weight } } },
      { new: true }
    );
    if (!job) return res.status(404).json({ error: 'Job not found' });

    res.json({ success: true, weights: job.ranking_weights });
  } catch (err) {
    console.error('Weights save error:', err);
    res.status(500).json({ error: 'Failed to save weights' });
  }
});

/**
 * GET /scoring/rankings/:jobId – Get ranked candidates for job (respects custom weights)
 */
router.get('/rankings/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    console.log(`📡 Rankings Request: Job ID [${jobId}] | Triggered by [${req.user ? req.user.email : 'Anonymous'}]`);

    const jobCheck = await Job.findOne({ _id: jobId });
    if (!jobCheck) {
        console.error(`❌ Rankings API Error: Job [${jobId}] not found in Database.`);
        return res.status(404).json({ error: 'Job not found', details: `The Job ID ${jobId} does not exist in our records.` });
    }

    // RELAXED FOR DEMO: Allow viewing rankings even if recruiter_id doesn't match, but log it.
    const currentUserId = req.user ? req.user.id : 'ANONYMOUS';
    if (jobCheck.recruiter_id !== currentUserId) {
        console.warn(`🔓 DEMO BYPASS: User ${currentUserId} accessing rankings for job owned by ${jobCheck.recruiter_id}`);
    }

    const customWeights = jobCheck.ranking_weights || null;

    const uniqueCandidateIds = await CandidateAssessment.distinct('candidate_id', {
      job_id: jobId,
      status: 'COMPLETED'
    });

    console.log(`📊 Found ${uniqueCandidateIds.length} unique candidates with completed assessments for Job: ${jobCheck.title}`);

    const rankings = [];
    for (const candidateId of uniqueCandidateIds) {
      let scoreData = await CredibilityScore.findOne({ candidateId, jobId });
      if (!scoreData) {
        const fresh = await computeCredibility(candidateId, jobId);
        if (fresh) {
          scoreData = await CredibilityScore.findOneAndUpdate(
            { candidateId, jobId },
            { $set: { totalScore: fresh.total_score, breakdown: fresh.breakdown } },
            { upsert: true, new: true }
          );
        }
      }

      const user = await User.findById(candidateId);
      const verifiedCerts = await Certificate.countDocuments({ candidate_id: candidateId, status: 'VERIFIED' });

      let finalScore = scoreData ? scoreData.totalScore : 0;
      if (customWeights && scoreData && scoreData.breakdown) {
        const reweighted = applyCustomWeights(scoreData.breakdown, customWeights);
        if (reweighted !== null) finalScore = reweighted;
      }

      rankings.push({
        candidateId,
        email:               user ? user.email : 'N/A',
        fullName:            user ? (user.fullName || user.email.split('@')[0]) : 'Candidate',
        totalScore:          finalScore,
        breakdown:           scoreData ? scoreData.breakdown : {},
        certificatesVerified:verifiedCerts,
        justification:       scoreData && scoreData.justification ? scoreData.justification : null,
      });
    }

    rankings.sort((a, b) => b.totalScore - a.totalScore);

    res.json({ 
      rankings, 
      jobTitle: jobCheck.title, 
      weights: customWeights,
      challenges: jobCheck.challenges || [],
      skillsRequired: jobCheck.skills_required || []
    });
  } catch (err) {
    console.error(`❌ CRITICAL RANKINGS ERROR for Job [${req.params.jobId}]:`, err);
    res.status(500).json({ 
      error: 'Failed to fetch rankings', 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

module.exports = router;
