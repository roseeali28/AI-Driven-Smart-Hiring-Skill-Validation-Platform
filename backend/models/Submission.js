const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    userId: {
        type: String, // Matching main User _id (UUID)
        ref: 'User',
        required: false 
    },
    problemId: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    status: {
        type: String, // Accepted, Wrong Answer, Error
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Submission', submissionSchema);
