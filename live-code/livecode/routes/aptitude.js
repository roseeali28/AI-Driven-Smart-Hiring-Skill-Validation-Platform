const express = require('express');
const router = express.Router();
const AptitudeQuestion = require('../models/AptitudeQuestion');
const AptitudeResult = require('../models/AptitudeResult');

// @route   GET api/aptitude/topics
// @desc    Get all unique aptitude categories and topics
router.get('/topics', async (req, res) => {
    try {
        const result = await AptitudeQuestion.aggregate([
            {
                $group: {
                    _id: { category: "$category", topic: "$topic" },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: "$_id.category",
                    topics: {
                        $push: { name: "$_id.topic", questionCount: "$count" }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const categories = result.map(cat => ({
            category: cat._id,
            topics: cat.topics.sort((a, b) => a.name.localeCompare(b.name))
        }));

        res.json(categories);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/aptitude
// @desc    Get aptitude questions (optionally filtered by topic or category)
router.get('/', async (req, res) => {
    try {
        const { topic, category } = req.query;
        let query = {};
        if (topic) query.topic = topic;
        if (category) query.category = category;

        // Fetch up to 20 questions for longer practice chunks
        const questions = await AptitudeQuestion.find(query).limit(20);
        res.json(questions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/aptitude/submit
// @desc    Submit aptitude test results
router.post('/submit', async (req, res) => {
    try {
        const { userId, topic, category, score, totalQuestions, correctAnswers, wrongAnswers } = req.body;

        if (!userId || userId === 'undefined' || !topic || score === undefined) {
            return res.status(400).json({ error: 'Missing or invalid required fields' });
        }

        // Validate ObjectId format
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: 'Invalid User ID format' });
        }

        const newResult = new AptitudeResult({
            userId,
            topic,
            category: category || 'General',
            score,
            totalQuestions,
            correctAnswers,
            wrongAnswers
        });

        await newResult.save();
        res.status(201).json({ message: 'Result submitted successfully', result: newResult });
    } catch (err) {
        console.error('Error submitting result:', err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// @route   GET api/aptitude/results
// @desc    Get all aptitude results (for recruiter view)
router.get('/results', async (req, res) => {
    try {
        const results = await AptitudeResult.find().sort({ completedAt: -1 });
        res.json(results);
    } catch (err) {
        console.error('Error fetching results:', err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// @route   GET api/aptitude/results/:userId
// @desc    Get aptitude results for a specific user
router.get('/results/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Basic validation for MongoDB ObjectId
        if (!userId || userId === 'undefined' || !userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: 'Invalid User ID format' });
        }

        const results = await AptitudeResult.find({ userId }).sort({ completedAt: -1 });
        res.json(results);
    } catch (err) {
        console.error('Error fetching user results:', err);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
