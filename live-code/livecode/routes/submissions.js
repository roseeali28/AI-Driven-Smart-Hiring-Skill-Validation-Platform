const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');

// POST /api/submissions - Save a new submission
router.post('/', async (req, res) => {
    try {
        const { problemId, code, language, status, output, executionTime } = req.body;

        if (!problemId || !code || !status) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newSubmission = new Submission({
            problemId,
            code,
            language,
            status,
            output,
            executionTime
        });

        const savedSubmission = await newSubmission.save();
        res.status(201).json(savedSubmission);
    } catch (err) {
        console.error('Error saving submission:', err);
        res.status(500).json({ error: 'Failed to save submission' });
    }
});

// GET /api/submissions - Fetch all submissions (for AI Analysis)
router.get('/', async (req, res) => {
    if (req.isOffline) {
        return res.json([
            { _id: 's1', problemId: '1', code: 'console.log("hello")', status: 'Accepted', createdAt: new Date() },
            { _id: 's2', problemId: '2', code: 'return s.reverse()', status: 'Accepted', createdAt: new Date() }
        ]);
    }
    try {
        const submissions = await Submission.find().sort({ createdAt: -1 }).limit(10);
        res.json(submissions);
    } catch (err) {
        console.error('Error fetching submissions:', err);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

module.exports = router;
