
const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: true
    },
    tags: [String],
    exampleInput: String,
    exampleOutput: String,
    constraints: [String],
    testCases: [{
        input: String,
        output: String,
        hidden: { type: Boolean, default: false }
    }]
});

module.exports = mongoose.model('Problem', problemSchema);
