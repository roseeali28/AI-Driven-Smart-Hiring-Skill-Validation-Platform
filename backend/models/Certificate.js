const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const certificateSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  candidate_id: { type: String, ref: 'User' }, // Optional if issued to external name
  issued_to_name: { type: String, required: true },
  course_name: { type: String, required: true },
  platform: { type: String, default: 'HiredUp' },
  issue_date: { type: Date, default: Date.now },
  expiry_date: { type: Date },
  issued_by: { type: String, default: 'HiredUp Authority' },
  file_path: { type: String },
  credential_url: { type: String },
  trust_score: { type: Number, default: 100 }, // Our own certs are 100% trust
  status: { type: String, enum: ['VALID', 'REVOKED', 'EXPIRED', 'PENDING'], default: 'VALID' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  hash_signature: { type: String } // For integrity verification
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

certificateSchema.virtual('id').get(function() { return this._id; });

module.exports = mongoose.model('Certificate', certificateSchema);
