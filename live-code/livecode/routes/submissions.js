const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');

// POST /api/submissions - Save a new submission
router.post('/', async (req, res) => {
    try {
        const { problemId, code, language, status, output, executionTime } = req.body;

        // Handle optional User ID (req.user is set by global authenticate middleware)
        const userId = req.user ? req.user.id : 'ANONYMOUS_USER';

        if (req.authError) {
            console.log(`ℹ️ Submission without verified user: ${req.authError}`);
        }

        if (!problemId || !code || !status) {
            return res.status(400).json({ error: 'Missing required fields: problemId, code, status' });
        }

        // Offline fallback: DB not connected
        if (req.isOffline) {
            console.warn('⚠️ [Offline Mode] Submission not persisted to DB.');
            return res.status(201).json({
                _id: 'offline_' + Date.now(),
                userId, problemId, code, language, status, output,
                message: 'Offline mode — submission recorded locally only'
            });
        }

        const newSubmission = new Submission({
            userId,
            problemId,
            code,
            language: language || 'unknown',
            status,
            output,
            executionTime
        });

        const savedSubmission = await newSubmission.save();
        res.status(201).json(savedSubmission);
    } catch (err) {
        console.error('Error saving submission:', err.name, '-', err.message);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: 'Validation error: ' + err.message });
        }
        res.status(500).json({ error: 'Failed to save submission', detail: err.message });
    }
});

// GET /api/submissions - Fetch all submissions for the current user
router.get('/', async (req, res) => {
    if (req.isOffline) {
        return res.json([
            { _id: 's1', problemId: '1', code: 'console.log("hello")', status: 'Accepted', createdAt: new Date() },
            { _id: 's2', problemId: '2', code: 'return s.reverse()', status: 'Accepted', createdAt: new Date() }
        ]);
    }
    try {
        const userId = req.user ? req.user.id : 'ANONYMOUS_USER';
        const submissions = await Submission.find({ userId }).sort({ createdAt: -1 });
        res.json(submissions);
    } catch (err) {
        console.error('Error fetching submissions:', err);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

module.exports = router;
