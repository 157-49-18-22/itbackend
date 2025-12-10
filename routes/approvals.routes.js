const express = require('express');
const router = express.Router();
const {
    getApprovals,
    getApproval,
    createApproval,
    respondToApproval,
    cancelApproval,
    getPendingCount
} = require('../controllers/approvals.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

// GET /api/approvals - Get all approvals (filtered by user role)
router.get('/', getApprovals);

// GET /api/approvals/pending/count - Get pending approvals count
router.get('/pending/count', getPendingCount);

// POST /api/approvals - Create new approval request
router.post('/', createApproval);

// GET /api/approvals/:id - Get single approval
router.get('/:id', getApproval);

// PUT /api/approvals/:id/respond - Approve/reject approval
router.put('/:id/respond', respondToApproval);

// PUT /api/approvals/:id/cancel - Cancel approval request
router.put('/:id/cancel', cancelApproval);

module.exports = router;
