const mongoose = require('mongoose');

const AptitudeQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    options: {
        type: [String],
        required: true
    },
    correctAnswer: {
        type: Number,
        required: true // Index of the correct option
    },
    topic: {
        type: String,
        required: true,
        index: true
    },
    category: {
        type: String,
        required: true,
        index: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Easy'
    }
}, { timestamps: true });

module.exports = mongoose.model('AptitudeQuestion', AptitudeQuestionSchema);
