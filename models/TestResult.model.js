const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  testCase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestCase',
    required: [true, 'Please add a test case ID']
  },
  status: {
    type: String,
    required: [true, 'Please add a status'],
    enum: ['passed', 'failed', 'blocked', 'not_run'],
    default: 'not_run'
  },
  executedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please add a user ID']
  },
  executionDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  },
  attachments: [{
    type: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('TestResult', testResultSchema);
