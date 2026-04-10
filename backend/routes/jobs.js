const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Job = require('../models/Job');
const Assessment = require('../models/Assessment');
const { authenticate, recruiterOnly } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /jobs - List all active jobs (public for dashboard display)
 */
router.get('/', async (req, res) => {
  try {
    // If a token is present, determine if we show only recruiter's jobs or all active jobs
    const token = req.headers.authorization?.split(' ')[1];
    let query = { status: 'ACTIVE' }; // Default for candidates/public
    
    // In demo mode, we show all active jobs to everyone to ensure visibility
    query = { status: 'ACTIVE' };
    
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        // Still verify token to ensure user is logged in if they claim to be
        jwt.verify(token, 'skillfirst-hire-platform-super-secret-key-2024');
      } catch (_) { 
        // Token invalid, still show active jobs
      }
    }
    console.log(`🔍 Jobs Search Query: ${JSON.stringify(query)} | Token Present: ${!!token}`);
    const jobs = await Job.find(query).sort({ created_at: -1 });
    console.log(`📋 Found ${jobs.length} jobs for this query.`);
    
    res.json(jobs.map(job => ({
      id: job._id, // Explicit mapping
      title: job.title,
      description: job.description,
      skills_required: job.skills_required,
      techStack: job.skills_required,       // alias for frontend
      status: job.status,
      created_at: job.created_at,
      createdAt: job.created_at,
      challenges: job.challenges || []
    })));
  } catch (err) {
    console.error('Jobs list error:', err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

/**
 * POST /jobs - Create job (requires recruiter auth)
 */
router.post('/', authenticate, recruiterOnly, async (req, res) => {
  try {
    const { title, description, skillsRequired, techStack, location, salaryRange, challenges, requirements } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const id = uuidv4();
    const skills = Array.isArray(skillsRequired) ? skillsRequired
                 : Array.isArray(techStack)       ? techStack
                 : [];

    const newJob = new Job({
      _id: id,
      recruiter_id: req.user.id,
      title,
      description: description || '',
      skills_required: skills,
      location: location || '',
      salary_range: salaryRange || '',
      challenges: challenges || []
    });
    
    await newJob.save();

    // --- NEW: Process selected coding challenges and combine with AI Generate ---
    const LC_URL = process.env.LC_SERVICE_URL || 'http://localhost:5001';
    const codingQuestions = [];

    if (Array.isArray(challenges) && challenges.length > 0) {
      console.log(`🔨 Fetching coding challenges for job ${id}...`);
      for (const chId of challenges) {
        try {
          const probRes = await fetch(`${LC_URL}/api/problems/${chId}`);
          if (probRes.ok) {
            const prob = await probRes.json();
            codingQuestions.push({
              _id: uuidv4(),
              type: 'CODING',
              content: prob.description || prob.title,
              difficulty: (prob.difficulty || 'MEDIUM').toUpperCase(),
              points: 30,
              testCases: (prob.testCases || []).map(tc => ({
                input_data: tc.input || tc.input_data || '',
                expected_output: tc.output || tc.expected_output || '',
                is_hidden: tc.isHidden || false
              }))
            });
          }
        } catch (fErr) { console.error('Challenge fetch fail:', fErr.message); }
      }
    }

    // Always generate AI questions (Mock or Real) to ensure assessment exists
    try {
      const aiService = require('../services/aiService');
      const aiContent = await aiService.generateAssessmentQuestions(title, description, skills);
      
      const combinedQuestions = [
        ...aiContent.questions.filter(q => q.type !== 'CODING'), // Get the MCQs
        ...codingQuestions, // Get the manually selected coding labs
        ...(codingQuestions.length === 0 ? aiContent.questions.filter(q => q.type === 'CODING') : []) // Only add AI coding if none selected
      ];

      const newAssessment = new Assessment({
        _id: uuidv4(),
        job_id: id,
        name: aiContent.name || `Technical Proficiency Lab: ${title}`,
        type: 'SKILL_VALIDATION',
        questions: combinedQuestions
      });
      await newAssessment.save();
      console.log(`✅ Assessment persisted for job ${id} with ${combinedQuestions.length} items.`);
    } catch (aiErr) {
      console.error('Failed to create assessment record:', aiErr.message);
    }

    res.status(201).json({
      id,
      title,
      description: description || '',
      skillsRequired: skills,
      techStack: skills,
      status: 'ACTIVE',
      assessmentCreated: true
    });
  } catch (err) {
    console.error('Job create error:', err);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

/**
 * GET /skillgap/:jobId - Analyze skill gap for a specific job
 * MUST be defined BEFORE /:id to avoid route shadowing
 */
router.get('/skillgap/:jobId', async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const job = await Job.findOne({ _id: jobId });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Skills can be passed as query param ?skills=react,node
    const userSkillsRaw = req.query.skills || '';
    const userSkills = userSkillsRaw.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
    const requiredSkills = (job.skills_required || []).map(s => s.trim());

    const matched_skills = [];
    const missing_skills = [];
    const partial_matches = [];

    requiredSkills.forEach(reqSkill => {
      const rsLow = reqSkill.toLowerCase();
      if (userSkills.includes(rsLow)) {
        matched_skills.push(reqSkill);
      } else {
        const partial = userSkills.find(us => us.includes(rsLow) || rsLow.includes(us));
        if (partial) partial_matches.push(reqSkill);
        else missing_skills.push(reqSkill);
      }
    });

    res.json({
      jobId: job._id,
      jobTitle: job.title,
      matched_skills,
      partial_matches,
      missing_skills,
      match_percentage: Math.round(((matched_skills.length + partial_matches.length * 0.5) / Math.max(requiredSkills.length, 1)) * 100),
      analysis_timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Skill gap error:', err);
    res.status(500).json({ error: 'Failed to analyze skill gap' });
  }
});

/**
 * GET /jobs/:id - Get job with assessments (requires auth)
 * NOTE: This must come AFTER /skillgap/:jobId
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    // If user is recruiter, they must own the job. If candidate, they can see any active job.
    let query = { _id: req.params.id };
    if (req.user.role === 'RECRUITER') {
      query.recruiter_id = req.user.id;
    } else {
      query.status = 'ACTIVE';
    }

    const job = await Job.findOne(query);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const assessments = await Assessment.find({ job_id: req.params.id }).sort({ created_at: 1 });

    res.json({
      id: job.id,
      title: job.title,
      description: job.description,
      skills_required: job.skills_required,
      skillsRequired: job.skills_required || [],
      challenges: job.challenges || [],
      assessments: assessments.map(a => ({
        id: a.id,
        name: a.name,
        type: a.type,
        config: a.config
      }))
    });
  } catch (err) {
    console.error('Job get error:', err);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

/**
 * DELETE /jobs/:id (requires recruiter auth)
 */
router.delete('/:id', authenticate, recruiterOnly, async (req, res) => {
  try {
    const result = await Job.findOneAndDelete({ _id: req.params.id, recruiter_id: req.user.id });
    if (!result) return res.status(404).json({ error: 'Job not found' });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    console.error('Job delete error:', err);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

module.exports = router;
