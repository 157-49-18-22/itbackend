const express = require('express');
const router = express.Router();
const codeReviewController = require('../controllers/codeReview.controller');

router.get('/', codeReviewController.getAllReviews);
router.post('/', codeReviewController.createReview);
router.put('/:id/status', codeReviewController.updateStatus);

module.exports = router;
