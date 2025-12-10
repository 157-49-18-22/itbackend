const express = require('express');
const router = express.Router();
const {
    getComments,
    getCommentWithReplies,
    createComment,
    updateComment,
    deleteComment
} = require('../controllers/comments.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

// GET /api/comments?projectId=1&taskId=2 - Get comments with filters
router.get('/', getComments);

// POST /api/comments - Create new comment
router.post('/', createComment);

// GET /api/comments/:id - Get comment with replies
router.get('/:id', getCommentWithReplies);

// PUT /api/comments/:id - Update comment (own comments only)
router.put('/:id', updateComment);

// DELETE /api/comments/:id - Delete comment (own comments or admin)
router.delete('/:id', deleteComment);

module.exports = router;
