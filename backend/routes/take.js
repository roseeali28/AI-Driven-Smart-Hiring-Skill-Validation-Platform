const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const { authenticate, candidateOnly } = require('../middleware/auth');
const { executeCode } = require('../services/codeExecutor');

const router = express.Router();

router.use(authenticate);
router.use(candidateOnly);

const DIFFICULTY_WEIGHTS = { EASY: 1, MEDIUM: 2, HARD: 3 };

/**
 * GET /take/assessments?jobId= - List assessments for a job (for candidates)
 */
router.get('/assessments', async (req, res) => {
  try {
    const { jobId } = req.query;
    if (!jobId) return res.status(400).json({ error: 'jobId required' });

    const jobCheck = await pool.query(
      'SELECT id, title FROM jobs WHERE id = $1 AND status = $2',
      [jobId, 'ACTIVE']
    );
    if (jobCheck.rowCount === 0) return res.status(404).json({ error: 'Job not found' });

    const result = await pool.query(
      `SELECT a.id, a.name, a.type, 
        (SELECT COUNT(*) FROM questions q WHERE q.assessment_id = a.id) as question_count
       FROM assessments a WHERE a.job_id = $1 ORDER BY a.created_at`,
      [jobId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Take assessments error:', err);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

/**
 * GET /take/jobs - List jobs with assessments (for candidates)
 */
router.get('/jobs', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT j.id, j.title, j.description, j.skills_required,
        (SELECT COUNT(*) FROM assessments a WHERE a.job_id = j.id) as assessment_count
       FROM jobs j WHERE j.status = 'ACTIVE' ORDER BY j.created_at DESC`
    );

    for (const row of result.rows) {
      const taken = await pool.query(
        `SELECT COUNT(*) as c FROM candidate_assessments 
         WHERE candidate_id = $1 AND job_id = $2`,
        [req.user.id, row.id]
      );
      row.assessmentsTaken = parseInt(taken.rows[0].c, 10);
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Take jobs error:', err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

/**
 * GET /take/assessment/:assessmentId?jobId= - Get assessment for taking (no correct answers)
 */
router.get('/assessment/:assessmentId', async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { jobId } = req.query;
    if (!jobId) return res.status(400).json({ error: 'jobId required' });

    const jobCheck = await pool.query(
      'SELECT id FROM jobs WHERE id = $1 AND status = $2',
      [jobId, 'ACTIVE']
    );
    if (jobCheck.rowCount === 0) return res.status(404).json({ error: 'Job not found' });

    const assessResult = await pool.query(
      'SELECT id, name, type FROM assessments WHERE id = $1 AND job_id = $2',
      [assessmentId, jobId]
    );
    if (assessResult.rowCount === 0) return res.status(404).json({ error: 'Assessment not found' });

    const existing = await pool.query(
      `SELECT id, status, completed_at FROM candidate_assessments 
       WHERE candidate_id = $1 AND assessment_id = $2 AND job_id = $3`,
      [req.user.id, assessmentId, jobId]
    );

    if (existing.rowCount > 0) {
      const ca = existing.rows[0];
      if (ca.status === 'COMPLETED') {
        return res.status(400).json({ error: 'Assessment already completed' });
      }
    }

    const questionsResult = await pool.query(
      `SELECT id, type, content, options, difficulty, points, order_index
       FROM questions WHERE assessment_id = $1 ORDER BY order_index`
    );

    const questions = questionsResult.rows.map((q) => {
      const { options, ...rest } = q;
      return {
        ...rest,
        options: options,
        testCases: undefined,
      };
    });

    for (const q of questions) {
      if (q.type === 'CODING') {
        const tcs = await pool.query(
          'SELECT input_data, expected_output, is_hidden FROM test_cases WHERE question_id = $1 AND is_hidden = false',
          [q.id]
        );
        q.testCases = tcs.rows;
      }
    }

    res.json({
      assessment: assessResult.rows[0],
      questions,
    });
  } catch (err) {
    console.error('Take assessment error:', err);
    res.status(500).json({ error: 'Failed to fetch assessment' });
  }
});

/**
 * POST /take/start - Start assessment
 */
router.post('/start', async (req, res) => {
  try {
    const { assessmentId, jobId } = req.body;
    if (!assessmentId || !jobId) {
      return res.status(400).json({ error: 'assessmentId and jobId required' });
    }

    const jobCheck = await pool.query(
      'SELECT id FROM jobs WHERE id = $1 AND status = $2',
      [jobId, 'ACTIVE']
    );
    if (jobCheck.rowCount === 0) return res.status(404).json({ error: 'Job not found' });

    const assessCheck = await pool.query(
      'SELECT id FROM assessments WHERE id = $1 AND job_id = $2',
      [assessmentId, jobId]
    );
    if (assessCheck.rowCount === 0) return res.status(404).json({ error: 'Assessment not found' });

    let caResult = await pool.query(
      `SELECT id, started_at FROM candidate_assessments 
       WHERE candidate_id = $1 AND assessment_id = $2 AND job_id = $3`,
      [req.user.id, assessmentId, jobId]
    );

    let caId;
    if (caResult.rowCount > 0) {
      caId = caResult.rows[0].id;
    } else {
      caId = uuidv4();
      await pool.query(
        `INSERT INTO candidate_assessments (id, candidate_id, assessment_id, job_id)
         VALUES ($1, $2, $3, $4)`,
        [caId, req.user.id, assessmentId, jobId]
      );
    }

    res.status(201).json({ candidateAssessmentId: caId });
  } catch (err) {
    console.error('Start assessment error:', err);
    res.status(500).json({ error: 'Failed to start assessment' });
  }
});

/**
 * POST /take/submit - Submit answers and grade
 */
router.post('/submit', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { candidateAssessmentId, answers } = req.body;
    if (!candidateAssessmentId || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'candidateAssessmentId and answers array required' });
    }

    const caResult = await client.query(
      `SELECT ca.id, ca.assessment_id, ca.job_id FROM candidate_assessments ca
       WHERE ca.id = $1 AND ca.candidate_id = $2 AND ca.status = 'IN_PROGRESS'`,
      [candidateAssessmentId, req.user.id]
    );

    if (caResult.rowCount === 0) {
      return res.status(404).json({ error: 'Assessment not found or already completed' });
    }

    const ca = caResult.rows[0];
    let totalRaw = 0;
    let totalWeighted = 0;
    let totalWeight = 0;

    for (const ans of answers) {
      const { questionId, response, timeSpentSeconds } = ans;

      const qResult = await client.query(
        'SELECT id, type, correct_answer, difficulty, points FROM questions WHERE id = $1 AND assessment_id = $2',
        [questionId, ca.assessment_id]
      );

      if (qResult.rowCount === 0) continue;

      const q = qResult.rows[0];
      const weight = DIFFICULTY_WEIGHTS[q.difficulty] || 2;
      let isCorrect = false;
      let pointsEarned = 0;

      if (q.type === 'MCQ_SINGLE' || q.type === 'MCQ_MULTIPLE') {
        const correct = Array.isArray(q.correct_answer) ? q.correct_answer : [q.correct_answer];
        const resp = Array.isArray(response) ? response : [response];
        isCorrect =
          correct.length === resp.length &&
          correct.every((c, i) => String(c).trim() === String(resp[i]).trim());
        pointsEarned = isCorrect ? q.points : 0;
      } else if (q.type === 'CODING') {
        const testCases = await client.query(
          'SELECT input_data, expected_output FROM test_cases WHERE question_id = $1',
          [questionId]
        );

        let passed = 0;
        for (const tc of testCases.rows) {
          const runResult = await executeCode(response, tc.input_data || '');
          const expected = (tc.expected_output || '').trim();
          const actual = ((runResult.stdout || '') + (runResult.stderr || '')).trim();
          if (actual === expected) passed++;
        }
        isCorrect = passed === testCases.rows.length && testCases.rows.length > 0;
        pointsEarned = testCases.rows.length > 0 ? Math.round((passed / testCases.rows.length) * q.points) : 0;
      }

      totalRaw += pointsEarned;
      totalWeighted += pointsEarned * weight;
      totalWeight += q.points * weight;

      await client.query(
        `INSERT INTO answers (candidate_assessment_id, question_id, response, is_correct, points_earned, time_spent_seconds)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          candidateAssessmentId,
          questionId,
          typeof response === 'object' ? JSON.stringify(response) : response,
          isCorrect,
          pointsEarned,
          timeSpentSeconds || 0,
        ]
      );
    }

    const maxWeighted = totalWeight || 1;
    const weightedScore = totalWeight > 0 ? Math.round((totalWeighted / maxWeighted) * 100) : 0;

    await client.query(
      `UPDATE candidate_assessments SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP, 
       raw_score = $1, weighted_score = $2 WHERE id = $3`,
      [totalRaw, weightedScore, candidateAssessmentId]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Assessment submitted',
      rawScore: totalRaw,
      weightedScore,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Submit error:', err);
    res.status(500).json({ error: err.message || 'Failed to submit assessment' });
  } finally {
    client.release();
  }
});

module.exports = router;
