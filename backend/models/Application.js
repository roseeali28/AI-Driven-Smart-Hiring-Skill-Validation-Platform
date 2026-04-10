const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const applicationSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  job_id: {
    type: String,
    required: true,
    ref: 'Job'
  },
  candidate_id: {
    type: String,
    required: true,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['APPLIED', 'REVIEWING', 'INTERVIEWING', 'ACCEPTED', 'REJECTED'],
    default: 'APPLIED'
  },
  overall_score: {
    type: Number,
    default: 0
  },
  applied_at: {
    type: Date,
    default: Date.now
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

applicationSchema.virtual('id').get(function() { return this._id; });

module.exports = mongoose.model('Application', applicationSchema);
