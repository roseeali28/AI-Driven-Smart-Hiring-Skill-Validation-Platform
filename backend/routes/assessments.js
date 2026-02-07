const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const { authenticate, recruiterOnly } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.use(recruiterOnly);

/**
 * POST /assessments - Create assessment with questions
 * Body: { jobId, name, type, questions: [{ type, content, options?, correctAnswer, difficulty, points, testCases? }] }
 */
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { jobId, name, type, questions } = req.body;
    if (!jobId || !name || !type || !Array.isArray(questions)) {
      return res.status(400).json({ error: 'jobId, name, type, and questions array required' });
    }

    const jobCheck = await client.query(
      'SELECT id FROM jobs WHERE id = $1 AND recruiter_id = $2',
      [jobId, req.user.id]
    );
    if (jobCheck.rowCount === 0) return res.status(404).json({ error: 'Job not found' });

    const assessmentId = uuidv4();
    await client.query(
      'INSERT INTO assessments (id, job_id, name, type) VALUES ($1, $2, $3, $4)',
      [assessmentId, jobId, name, type]
    );

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const questionId = uuidv4();
      await client.query(
        `INSERT INTO questions (id, assessment_id, type, content, options, correct_answer, difficulty, points, order_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          questionId,
          assessmentId,
          q.type || 'MCQ_SINGLE',
          q.content,
          q.options ? JSON.stringify(q.options) : null,
          q.correctAnswer ? JSON.stringify(q.correctAnswer) : null,
          q.difficulty || 'MEDIUM',
          q.points || 10,
          i,
        ]
      );

      if (q.type === 'CODING' && Array.isArray(q.testCases)) {
        for (const tc of q.testCases) {
          await client.query(
            'INSERT INTO test_cases (question_id, input_data, expected_output, is_hidden) VALUES ($1, $2, $3, $4)',
            [questionId, tc.input || '', tc.expectedOutput || tc.expected_output || '', tc.isHidden || false]
          );
        }
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ id: assessmentId, name, type, questionCount: questions.length });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Assessment create error:', err);
    res.status(500).json({ error: 'Failed to create assessment' });
  } finally {
    client.release();
  }
});

/**
 * GET /assessments?jobId= - List assessments for job
 */
router.get('/', async (req, res) => {
  try {
    const { jobId } = req.query;
    if (!jobId) return res.status(400).json({ error: 'jobId required' });

    const jobCheck = await pool.query(
      'SELECT id FROM jobs WHERE id = $1 AND recruiter_id = $2',
      [jobId, req.user.id]
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
    console.error('Assessments list error:', err);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

/**
 * GET /assessments/:id - Get assessment with questions (for recruiter)
 */
router.get('/:id', async (req, res) => {
  try {
    const assessResult = await pool.query(
      `SELECT a.id, a.name, a.type, a.job_id 
       FROM assessments a 
       JOIN jobs j ON a.job_id = j.id 
       WHERE a.id = $1 AND j.recruiter_id = $2`,
      [req.params.id, req.user.id]
    );

    const assessment = assessResult.rows[0];
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

    const questionsResult = await pool.query(
      `SELECT id, type, content, options, correct_answer, difficulty, points, order_index
       FROM questions WHERE assessment_id = $1 ORDER BY order_index`,
      [req.params.id]
    );

    const questions = questionsResult.rows;
    for (const q of questions) {
      if (q.type === 'CODING') {
        const tcs = await pool.query(
          'SELECT id, input_data, expected_output, is_hidden FROM test_cases WHERE question_id = $1',
          [q.id]
        );
        q.testCases = tcs.rows;
      }
    }

    res.json({
      ...assessment,
      questions: questions.map(({ correct_answer, ...rest }) => ({
        ...rest,
        correctAnswer: correct_answer,
      })),
    });
  } catch (err) {
    console.error('Assessment get error:', err);
    res.status(500).json({ error: 'Failed to fetch assessment' });
  }
});

module.exports = router;
