const mongoose = require('mongoose');

const credibilityScoreSchema = new mongoose.Schema({
  candidate_id: { type: String, required: true, ref: 'User' },
  job_id: { type: String, required: true, ref: 'Job' },
  total_score: { type: Number, default: 0 },
  breakdown: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Compound index to act like ON CONFLICT (candidate_id, job_id)
credibilityScoreSchema.index({ candidate_id: 1, job_id: 1 }, { unique: true });

module.exports = mongoose.model('CredibilityScore', credibilityScoreSchema);
