const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['RECRUITER', 'CANDIDATE'],
    required: true,
  },
  fullName: {
    type: String,
  },
  companyName: {
    type: String,
  },
  designation: {
    type: String,
  },
  // Profile fields
  about: { type: String },
  education: { type: String },
  experience: { type: String },
  github: { type: String }, // Unified name
  githubUrl: { type: String }, // Legacy support
  leetcode: { type: String }, // New field
  linkedinUrl: { type: String },
  phone: { type: String },
  skills: { type: [String], default: [] },
  resume: { type: String },
  certificate: { type: String }
}, { timestamps: true });

// Align with how old queries used them
userSchema.virtual('id').get(function() {
  return this._id;
});

module.exports = mongoose.model('User', userSchema, 'candidates');
