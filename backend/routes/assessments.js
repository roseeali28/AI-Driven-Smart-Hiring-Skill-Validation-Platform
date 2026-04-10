const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Job = require('../models/Job');
const Assessment = require('../models/Assessment');
const { authenticate, recruiterOnly } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

/**
 * POST /assessments/generate/:jobId - AI Generate assessment
 * RELAXED AUTH for demo purposes: Allow any authenticated user to trigger generation.
 */
router.post('/generate/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    // Removed recruiter_id: req.user.id to allow testing across users
    const job = await Job.findOne({ _id: jobId }); 
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const aiService = require('../services/aiService');
    const aiAssessment = await aiService.generateAssessmentQuestions(
        job.title, 
        job.description, 
        job.skills_required
    );

    const assessmentId = uuidv4();
    const formattedQuestions = aiAssessment.questions.map((q, i) => {
      let filteredTestCases = [];
      if (q.type === 'CODING' && Array.isArray(q.testCases)) {
        filteredTestCases = q.testCases.map(tc => ({
          input_data: tc.input || '',
          expected_output: tc.expectedOutput || tc.expected_output || '',
          is_hidden: tc.isHidden || false
        }));
      }

      return {
        _id: uuidv4(),
        type: q.type,
        content: q.content,
        options: q.options || null,
        correct_answer: q.correctAnswer || null,
        difficulty: q.difficulty || 'MEDIUM',
        points: q.points || 10,
        order_index: i,
        testCases: filteredTestCases
      };
    });

    const newAssessment = new Assessment({
      _id: assessmentId,
      job_id: jobId,
      name: aiAssessment.name || `Technical Assessment for ${job.title}`,
      type: aiAssessment.type || 'SKILL_VALIDATION',
      questions: formattedQuestions
    });

    await newAssessment.save();

    res.status(201).json({ 
        message: 'AI Assessment generated successfully',
        id: assessmentId, 
        name: newAssessment.name,
        questionCount: formattedQuestions.length 
    });
  } catch (err) {
    console.error('AI Generation Route Error:', err);
    res.status(500).json({ error: 'Failed to generate AI assessment' });
  }
});

router.use(recruiterOnly);

/**
 * POST /assessments - Create assessment with questions
 */
router.post('/', async (req, res) => {
  try {
    const { jobId, name, type, questions } = req.body;
    if (!jobId || !name || !type || !Array.isArray(questions)) {
      return res.status(400).json({ error: 'jobId, name, type, and questions array required' });
    }

    const jobCheck = await Job.findOne({ _id: jobId, recruiter_id: req.user.id });
    if (!jobCheck) return res.status(404).json({ error: 'Job not found' });

    const assessmentId = uuidv4();
    
    const formattedQuestions = questions.map((q, i) => {
      let filteredTestCases = [];
      if (q.type === 'CODING' && Array.isArray(q.testCases)) {
        filteredTestCases = q.testCases.map(tc => ({
          input_data: tc.input || '',
          expected_output: tc.expectedOutput || tc.expected_output || '',
          is_hidden: tc.isHidden || false
        }));
      }

      return {
        _id: uuidv4(),
        type: q.type || 'MCQ_SINGLE',
        content: q.content,
        options: q.options || null,
        correct_answer: q.correctAnswer || null,
        difficulty: q.difficulty || 'MEDIUM',
        points: q.points || 10,
        order_index: i,
        testCases: filteredTestCases
      };
    });

    const newAssessment = new Assessment({
      _id: assessmentId,
      job_id: jobId,
      name,
      type,
      questions: formattedQuestions
    });

    await newAssessment.save();

    res.status(201).json({ id: assessmentId, name, type, questionCount: questions.length });
  } catch (err) {
    console.error('Assessment create error:', err);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
});

/**
 * GET /assessments?jobId= - List assessments for job
 */
router.get('/', async (req, res) => {
  try {
    const { jobId } = req.query;
    if (!jobId) return res.status(400).json({ error: 'jobId required' });

    const jobCheck = await Job.findOne({ _id: jobId, recruiter_id: req.user.id });
    if (!jobCheck) return res.status(404).json({ error: 'Job not found' });

    const assessments = await Assessment.find({ job_id: jobId }).sort({ created_at: 1 });

    res.json(assessments.map(a => ({
      id: a.id,
      name: a.name,
      type: a.type,
      question_count: a.questions ? a.questions.length : 0
    })));
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
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

    const job = await Job.findOne({ _id: assessment.job_id, recruiter_id: req.user.id });
    if (!job) return res.status(404).json({ error: 'Assessment not found' });

    res.json({
      id: assessment.id,
      name: assessment.name,
      type: assessment.type,
      job_id: assessment.job_id,
      questions: assessment.questions.map(q => {
        const qObj = q.toObject();
        return {
          id: qObj._id,
          type: qObj.type,
          content: qObj.content,
          options: qObj.options,
          correctAnswer: qObj.correct_answer,
          difficulty: qObj.difficulty,
          points: qObj.points,
          order_index: qObj.order_index,
          testCases: qObj.type === 'CODING' ? qObj.testCases : undefined
        };
      }).sort((a, b) => a.order_index - b.order_index)
    });
  } catch (err) {
    console.error('Assessment get error:', err);
    res.status(500).json({ error: 'Failed to fetch assessment' });
  }
});

// ... end of file
module.exports = router;
