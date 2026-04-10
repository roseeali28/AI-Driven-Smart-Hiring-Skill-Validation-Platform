const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['RECRUITER', 'CANDIDATE'], required: true },
  fullName: String,
  companyName: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Candidate', candidateSchema, 'candidates');
