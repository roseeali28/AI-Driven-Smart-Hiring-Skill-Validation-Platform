const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const { authenticate, recruiterOnly } = require('../middleware/auth');

const router = express.Router();

// All routes require auth + recruiter
router.use(authenticate);
router.use(recruiterOnly);

/**
 * GET /jobs - List jobs for recruiter
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, description, skills_required, status, created_at 
       FROM jobs WHERE recruiter_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Jobs list error:', err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

/**
 * POST /jobs - Create job
 */
router.post('/', async (req, res) => {
  try {
    const { title, description, skillsRequired } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const id = uuidv4();
    const skills = Array.isArray(skillsRequired) ? skillsRequired : [];

    await pool.query(
      `INSERT INTO jobs (id, recruiter_id, title, description, skills_required)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, req.user.id, title, description || '', skills]
    );

    res.status(201).json({
      id,
      title,
      description: description || '',
      skillsRequired: skills,
      status: 'ACTIVE',
    });
  } catch (err) {
    console.error('Job create error:', err);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

/**
 * GET /jobs/:id - Get job with assessments
 */
router.get('/:id', async (req, res) => {
  try {
    const jobResult = await pool.query(
      `SELECT id, title, description, skills_required, status, created_at 
       FROM jobs WHERE id = $1 AND recruiter_id = $2`,
      [req.params.id, req.user.id]
    );

    const job = jobResult.rows[0];
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const assessResult = await pool.query(
      `SELECT id, name, type, config FROM assessments WHERE job_id = $1 ORDER BY created_at`,
      [req.params.id]
    );

    res.json({
      ...job,
      skillsRequired: job.skills_required || [],
      assessments: assessResult.rows,
    });
  } catch (err) {
    console.error('Job get error:', err);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

/**
 * DELETE /jobs/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM jobs WHERE id = $1 AND recruiter_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Job not found' });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    console.error('Job delete error:', err);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

module.exports = router;
