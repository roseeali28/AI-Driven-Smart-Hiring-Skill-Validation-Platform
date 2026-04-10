const express = require('express');
const router = express.Router();
const InterviewResult = require('../models/InterviewResult');
const { authenticate } = require('../middleware/auth');

// @route   POST /api/interview/results
// @desc    Save an interview session result
// @access  Private
router.post('/results', authenticate, async (req, res) => {
    try {
        const { role, questionType, level, avgScore, questions } = req.body;
        
        if (!role || avgScore === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newResult = new InterviewResult({
            userId: req.user.id,
            role,
            questionType: questionType || 'mixed',
            level: level || 'mid',
            avgScore,
            questions: questions || []
        });

        const savedResult = await newResult.save();
        res.status(201).json(savedResult);
    } catch (err) {
        console.error('Error saving interview result:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   GET /api/interview/results/me
// @desc    Get current user's interview results
// @access  Private
router.get('/results/me', authenticate, async (req, res) => {
    try {
        const results = await InterviewResult.find({ userId: req.user.id }).sort({ completedAt: -1 });
        res.json(results);
    } catch (err) {
        console.error('Error fetching interview results:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   GET /api/interview/results/user/:userId
// @desc    Get a specific user's interview results (For recruiters)
// @access  Private
router.get('/results/user/:userId', authenticate, async (req, res) => {
    try {
        // Option: add role check if needed
        const results = await InterviewResult.find({ userId: req.params.userId }).sort({ completedAt: -1 });
        res.json(results);
    } catch (err) {
        console.error('Error fetching user interview results:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
