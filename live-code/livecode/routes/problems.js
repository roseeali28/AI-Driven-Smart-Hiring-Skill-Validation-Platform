
const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');

// GET all problems
router.get('/', async (req, res) => {
    try {
        const problems = await Problem.find();
        res.json(problems);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET problem by ID
router.get('/:id', async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) return res.status(404).json({ message: 'Problem not found' });
        res.json(problem);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new problem (for admin/seeding)
router.post('/', async (req, res) => {
    const problem = new Problem({
        title: req.body.title,
        description: req.body.description,
        difficulty: req.body.difficulty,
        tags: req.body.tags,
        exampleInput: req.body.exampleInput,
        exampleOutput: req.body.exampleOutput,
        testCases: req.body.testCases
    });

    try {
        const newProblem = await problem.save();
        res.status(201).json(newProblem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
