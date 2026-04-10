const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const answerSchema = new mongoose.Schema({
  question_id: { type: String, required: true },
  response: { type: mongoose.Schema.Types.Mixed },
  is_correct: { type: Boolean, default: false },
  points_earned: { type: Number, default: 0 },
  time_spent_seconds: { type: Number, default: 0 }
}, { _id: false });

const candidateAssessmentSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  candidate_id: { type: String, required: true, ref: 'User' },
  assessment_id: { type: String, required: true, ref: 'Assessment' },
  job_id: { type: String, required: true, ref: 'Job' },
  status: { type: String, default: 'IN_PROGRESS' }, // IN_PROGRESS, COMPLETED
  raw_score: { type: Number, default: 0 },
  weighted_score: { type: Number, default: 0 },
  completed_at: { type: Date },
  answers: [answerSchema]
}, { timestamps: { createdAt: 'started_at', updatedAt: false } });

candidateAssessmentSchema.virtual('id').get(function() { return this._id; });

module.exports = mongoose.model('CandidateAssessment', candidateAssessmentSchema);
