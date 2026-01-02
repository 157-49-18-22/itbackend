const express = require('express');
const router = express.Router();
const discussionsController = require('../controllers/discussions.controller');

const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', discussionsController.getAllDiscussions);
router.post('/', discussionsController.createDiscussion);

module.exports = router;
