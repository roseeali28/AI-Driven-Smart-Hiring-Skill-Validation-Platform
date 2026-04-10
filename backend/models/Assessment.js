const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const testCaseSchema = new mongoose.Schema({
  input_data: { type: String, default: '' },
  expected_output: { type: String, default: '' },
  is_hidden: { type: Boolean, default: false }
}, { _id: false });

const questionSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  type: { type: String, required: true }, // 'MCQ_SINGLE', 'MCQ_MULTIPLE', 'CODING'
  content: { type: String, required: true },
  options: { type: mongoose.Schema.Types.Mixed },
  correct_answer: { type: mongoose.Schema.Types.Mixed },
  difficulty: { type: String, default: 'MEDIUM' },
  points: { type: Number, default: 10 },
  order_index: { type: Number, default: 0 },
  testCases: [testCaseSchema] // only applicable for CODING
});
questionSchema.virtual('id').get(function() { return this._id; });

const assessmentSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  job_id: { type: String, required: true, ref: 'Job' },
  name: { type: String, required: true },
  type: { type: String, required: true },
  config: { type: mongoose.Schema.Types.Mixed, default: {} },
  questions: [questionSchema]
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

assessmentSchema.virtual('id').get(function() { return this._id; });

module.exports = mongoose.model('Assessment', assessmentSchema);
