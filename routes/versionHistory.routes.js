const express = require('express');
const router = express.Router();
const versionHistoryController = require('../controllers/versionHistory.controller');

const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', versionHistoryController.getAllVersions);

module.exports = router;
