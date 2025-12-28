const express = require('express');
const router = express.Router();
const versionHistoryController = require('../controllers/versionHistory.controller');

router.get('/', versionHistoryController.getAllVersions);

module.exports = router;
