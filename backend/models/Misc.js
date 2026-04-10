const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  // Removed duplicate to avoid OverwriteModelError
});

const credibilityScoreSchema = new mongoose.Schema({
  candidateId: { type: String, ref: 'User', required: true },
  jobId: { type: String, ref: 'Job', required: true },
  totalScore: { type: Number, required: true },
  breakdown: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now }
});

credibilityScoreSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });

const refreshTokenSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  CredibilityScore: mongoose.model('CredibilityScore', credibilityScoreSchema),
  RefreshToken: mongoose.model('RefreshToken', refreshTokenSchema)
};
