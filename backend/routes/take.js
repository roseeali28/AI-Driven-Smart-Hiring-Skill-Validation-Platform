const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Job = require('../models/Job');
const Assessment = require('../models/Assessment');
const CandidateAssessment = require('../models/CandidateAssessment');
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

    const jobCheck = await Job.findOne({ _id: jobId, status: 'ACTIVE' });
    if (!jobCheck) return res.status(404).json({ error: 'Job not found' });

    const assessments = await Assessment.find({ job_id: jobId }).sort({ created_at: 1 });

    res.json(assessments.map(a => ({
      id: a.id,
      name: a.name,
      type: a.type,
      question_count: a.questions ? a.questions.length : 0
    })));
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
    const jobs = await Job.find({ status: 'ACTIVE' }).sort({ created_at: -1 });

    const result = [];
    for (const job of jobs) {
      const assessmentCount = await Assessment.countDocuments({ job_id: job.id });
      const takenCount = await CandidateAssessment.countDocuments({
        candidate_id: req.user.id,
        job_id: job.id
      });
      
      result.push({
        id: job.id,
        title: job.title,
        description: job.description,
        skills_required: job.skills_required,
        assessment_count: assessmentCount,
        assessmentsTaken: takenCount
      });
    }

    res.json(result);
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

    const jobCheck = await Job.findOne({ _id: jobId, status: 'ACTIVE' });
    if (!jobCheck) return res.status(404).json({ error: 'Job not found' });

    const assessment = await Assessment.findOne({ _id: assessmentId, job_id: jobId });
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

    const existing = await CandidateAssessment.findOne({
      candidate_id: req.user.id,
      assessment_id: assessmentId,
      job_id: jobId
    });

    if (existing && existing.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Assessment already completed' });
    }

    const filteredQuestions = assessment.questions.sort((a,b) => a.order_index - b.order_index).map(q => {
      let filteredTestCases = [];
      if (q.type === 'CODING') {
        filteredTestCases = q.testCases.filter(tc => !tc.is_hidden).map(tc => ({
          input_data: tc.input_data,
          expected_output: tc.expected_output,
          is_hidden: tc.is_hidden
        }));
      }

      return {
        id: q.id,
        type: q.type,
        content: q.content,
        options: q.options,
        difficulty: q.difficulty,
        points: q.points,
        order_index: q.order_index,
        testCases: q.type === 'CODING' ? filteredTestCases : undefined
      };
    });

    res.json({
      assessment: { id: assessment.id, name: assessment.name, type: assessment.type },
      questions: filteredQuestions,
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

    const jobCheck = await Job.findOne({ _id: jobId, status: 'ACTIVE' });
    if (!jobCheck) return res.status(404).json({ error: 'Job not found' });

    const assessCheck = await Assessment.findOne({ _id: assessmentId, job_id: jobId });
    if (!assessCheck) return res.status(404).json({ error: 'Assessment not found' });

    let ca = await CandidateAssessment.findOne({
      candidate_id: req.user.id,
      assessment_id: assessmentId,
      job_id: jobId
    });

    if (!ca) {
      ca = new CandidateAssessment({
        candidate_id: req.user.id,
        assessment_id: assessmentId,
        job_id: jobId
      });
      await ca.save();
    }

    res.status(201).json({ candidateAssessmentId: ca.id });
  } catch (err) {
    console.error('Start assessment error:', err);
    res.status(500).json({ error: 'Failed to start assessment' });
  }
});

/**
 * POST /take/submit - Submit answers and grade
 */
router.post('/submit', async (req, res) => {
  try {
    const { candidateAssessmentId, answers } = req.body;
    if (!candidateAssessmentId || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'candidateAssessmentId and answers array required' });
    }

    const ca = await CandidateAssessment.findOne({
      _id: candidateAssessmentId,
      candidate_id: req.user.id,
      status: 'IN_PROGRESS'
    });

    if (!ca) {
      return res.status(404).json({ error: 'Assessment not found or already completed' });
    }

    const assessment = await Assessment.findById(ca.assessment_id);
    if (!assessment) return res.status(404).json({ error: 'Referenced assessment not found' });

    let totalRaw = 0;
    let totalWeighted = 0;
    let totalWeight = 0;
    const finalAnswers = [];

    for (const ans of answers) {
      const { questionId, response, timeSpentSeconds } = ans;

      const q = assessment.questions.find(x => x.id === questionId);
      if (!q) continue;

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
        let passed = 0;
        for (const tc of q.testCases || []) {
          const runResult = await executeCode(response, tc.input_data || '');
          const expected = (tc.expected_output || '').trim();
          const actual = ((runResult.stdout || '') + (runResult.stderr || '')).trim();
          if (actual === expected) passed++;
        }
        const totalCases = (q.testCases || []).length;
        isCorrect = passed === totalCases && totalCases > 0;
        pointsEarned = totalCases > 0 ? Math.round((passed / totalCases) * q.points) : 0;
      }

      totalRaw += pointsEarned;
      totalWeighted += pointsEarned * weight;
      totalWeight += q.points * weight;

      finalAnswers.push({
        question_id: questionId,
        response: response,
        is_correct: isCorrect,
        points_earned: pointsEarned,
        time_spent_seconds: timeSpentSeconds || 0
      });
    }

    const maxWeighted = totalWeight || 1;
    const weightedScore = totalWeight > 0 ? Math.round((totalWeighted / maxWeighted) * 100) : 0;

    ca.status = 'COMPLETED';
    ca.completed_at = new Date();
    ca.raw_score = totalRaw;
    ca.weighted_score = weightedScore;
    ca.answers = finalAnswers;

    const Application = require('../models/Application');
    
    await ca.save();

    // Trigger Application Creation logic
    try {
      // Check if there are any other assessments for this job that the candidate hasn't completed
      const totalAssessments = await Assessment.countDocuments({ job_id: ca.job_id });
      const completedAssessments = await CandidateAssessment.countDocuments({
        candidate_id: req.user.id,
        job_id: ca.job_id,
        status: 'COMPLETED'
      });

      if (completedAssessments >= totalAssessments) {
        // All assessments done, create (or update) Application
        const existingApp = await Application.findOne({ candidate_id: req.user.id, job_id: ca.job_id });
        if (!existingApp) {
          // Calculate an overall score (average of weighted scores)
          const allCa = await CandidateAssessment.find({
            candidate_id: req.user.id,
            job_id: ca.job_id,
            status: 'COMPLETED'
          });
          const avgScore = allCa.reduce((acc, curr) => acc + curr.weighted_score, 0) / (allCa.length || 1);

          const newApp = new Application({
            candidate_id: req.user.id,
            job_id: ca.job_id,
            status: 'APPLIED',
            overall_score: Math.round(avgScore)
          });
          await newApp.save();
          console.log(`✅ Application created for candidate ${req.user.id} and job ${ca.job_id}`);
        }
      }
    } catch (appErr) {
      console.error('Application auto-submission error:', appErr);
      // Don't fail the response if application creation fails
    }

    res.json({
      message: 'Assessment submitted',
      rawScore: totalRaw,
      weightedScore,
      applied: true // hint to frontend
    });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ error: err.message || 'Failed to submit assessment' });
  }
});

module.exports = router;
