const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const jobSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  recruiter_id: {
    type: String,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: ''
  },
  skills_required: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    default: 'ACTIVE'
  },
  location: {
    type: String,
    default: ''
  },
  salary_range: {
    type: String,
    default: ''
  },
  ranking_weights: {
    assessment_weight: { type: Number, default: 35 },
    coding_weight: { type: Number, default: 25 },
    cert_weight: { type: Number, default: 20 },
    learning_weight: { type: Number, default: 10 },
    skill_weight: { type: Number, default: 10 }
  },
  challenges: {
    type: [String],
    default: []
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

jobSchema.virtual('id').get(function() { return this._id; });

module.exports = mongoose.model('Job', jobSchema);
