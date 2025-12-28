const express = require('express');
const router = express.Router();
const testingController = require('../controllers/testing.controller');

router.get('/suites', testingController.getTestSuites);
router.get('/dashboard-stats', testingController.getDashboardStats);

module.exports = router;
