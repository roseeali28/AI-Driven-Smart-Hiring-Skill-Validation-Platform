const mongoose = require('mongoose');

const interviewResultSchema = new mongoose.Schema({
    userId: {
        type: String,  // UUID from main backend — NOT a MongoDB ObjectId
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        required: true
    },
    questionType: {
        type: String, // 'behavioral', 'technical', 'mixed'
        required: true
    },
    level: {
        type: String,
        required: true
    },
    avgScore: {
        type: Number,
        required: true
    },
    questions: [{
        question: String,
        answer: String,
        score: Number,
        feedback: String,
        strengths: String,
        improvements: String
    }],
    completedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('InterviewResult', interviewResultSchema);
