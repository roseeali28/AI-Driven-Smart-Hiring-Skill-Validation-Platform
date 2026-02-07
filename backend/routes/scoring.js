const express = require('express');
const pool = require('../config/db');
const { authenticate, recruiterOnly } = require('../middleware/auth');

const router = express.Router();
const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

router.use(authenticate);
router.use(recruiterOnly);

async function computeCredibility(candidateId, jobId) {
  const candidate = await pool.query(
    'SELECT id FROM users WHERE id = $1',
    [candidateId]
  );
  if (candidate.rowCount === 0) return null;

  const job = await pool.query(
    'SELECT skills_required FROM jobs WHERE id = $1',
    [jobId]
  );
  const jobSkills = (job.rows[0]?.skills_required || []);

  const assessResult = await pool.query(
    `SELECT ca.weighted_score, ca.raw_score FROM candidate_assessments ca
     WHERE ca.candidate_id = $1 AND ca.job_id = $2 AND ca.status = 'COMPLETED'`,
    [candidateId, jobId]
  );

  const certResult = await pool.query(
    'SELECT trust_score FROM certificates WHERE candidate_id = $1 AND trust_score IS NOT NULL',
    [candidateId]
  );

  const assessmentScores = assessResult.rows.map(r => parseFloat(r.weighted_score) || 0);
  const avgAssessment = assessmentScores.length ? assessmentScores.reduce((a, b) => a + b, 0) / assessmentScores.length : 50;
  const certScores = certResult.rows.map(r => r.trust_score);

  const body = {
    assessment_score: avgAssessment,
    coding_score: avgAssessment,
    certificate_scores: certScores,
    assessment_scores_list: assessmentScores,
    candidate_skills: [],
    job_skills: jobSkills,
  };

  try {
    const res = await fetch(ML_URL + '/score/credibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (e) {
    return {
      total_score: avgAssessment,
      breakdown: {
        assessment_score: { value: avgAssessment, contribution: avgAssessment * 0.5 },
        coding_score: { value: avgAssessment, contribution: avgAssessment * 0.25 },
        certificate_trust: { value: certScores.length ? certScores.reduce((a, b) => a + b, 0) / certScores.length : 50, contribution: 10 },
        learning_aptitude: { value: 50, contribution: 5 },
        skill_relevance: { value: 80, contribution: 8 },
      },
    };
  }
}

/**
 * POST /scoring/compute - Compute credibility for candidate + job
 */
router.post('/compute', async (req, res) => {
  try {
    const { candidateId, jobId } = req.body;
    if (!candidateId || !jobId) return res.status(400).json({ error: 'candidateId and jobId required' });

    const jobCheck = await pool.query(
      'SELECT id FROM jobs WHERE id = $1 AND recruiter_id = $2',
      [jobId, req.user.id]
    );
    if (jobCheck.rowCount === 0) return res.status(404).json({ error: 'Job not found' });

    const result = await computeCredibility(candidateId, jobId);
    if (!result) return res.status(404).json({ error: 'Candidate not found' });

    await pool.query(
      `INSERT INTO credibility_scores (candidate_id, job_id, total_score, breakdown)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (candidate_id, job_id) DO UPDATE SET total_score = $3, breakdown = $4, created_at = CURRENT_TIMESTAMP`,
      [candidateId, jobId, result.total_score, JSON.stringify(result.breakdown)]
    );

    res.json(result);
  } catch (err) {
    console.error('Scoring error:', err);
    res.status(500).json({ error: 'Scoring failed' });
  }
});

/**
 * GET /scoring/rankings/:jobId - Get ranked candidates for job
 */
router.get('/rankings/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    const jobCheck = await pool.query(
      'SELECT id, title FROM jobs WHERE id = $1 AND recruiter_id = $2',
      [jobId, req.user.id]
    );
    if (jobCheck.rowCount === 0) return res.status(404).json({ error: 'Job not found' });

    const candidates = await pool.query(
      `SELECT DISTINCT ca.candidate_id FROM candidate_assessments ca
       WHERE ca.job_id = $1 AND ca.status = 'COMPLETED'`,
      [jobId]
    );

    const rankings = [];
    for (const row of candidates.rows) {
      const score = await computeCredibility(row.candidate_id, jobId);
      const user = await pool.query(
        'SELECT id, email, full_name FROM users WHERE id = $1',
        [row.candidate_id]
      );
      const certs = await pool.query(
        'SELECT trust_score, status FROM certificates WHERE candidate_id = $1',
        [row.candidate_id]
      );
      rankings.push({
        candidateId: row.candidate_id,
        email: user.rows[0]?.email,
        fullName: user.rows[0]?.full_name,
        totalScore: score?.total_score ?? 0,
        breakdown: score?.breakdown ?? {},
        certificatesVerified: certs.rows.filter(c => c.status === 'VERIFIED').length,
      });
    }

    rankings.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

    res.json({ rankings });
  } catch (err) {
    console.error('Rankings error:', err);
    res.status(500).json({ error: 'Failed to fetch rankings' });
  }
});

module.exports = router;
