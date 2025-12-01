const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['functional', 'integration', 'regression', 'smoke', 'sanity', 'performance'],
    default: 'functional'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['not_run', 'passed', 'failed', 'blocked'],
    default: 'not_run'
  },
  steps: [{
    step: String,
    expected: String
  }],
  expectedResult: {
    type: String,
    trim: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastRun: {
    type: Date
  },
  // Store SQL user ID for compatibility with SQL databases
  sqlUserId: {
    type: Number,
    index: true
  }
}, {
  timestamps: true
});

// Add a virtual for test results
testCaseSchema.virtual('testResults', {
  ref: 'TestResult',
  localField: '_id',
  foreignField: 'testCase',
  justOne: false
});

// Cascade delete test results when a test case is deleted
testCaseSchema.pre('remove', async function(next) {
  await this.model('TestResult').deleteMany({ testCase: this._id });
  next();
});

// Enable virtuals in toJSON
testCaseSchema.set('toJSON', { virtuals: true });
testCaseSchema.set('toObject', { virtuals: true });

const TestCase = mongoose.model('TestCase', testCaseSchema);

module.exports = TestCase;
