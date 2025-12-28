const express = require('express');
const router = express.Router();
const codingController = require('../controllers/coding.controller');

router.get('/stats', codingController.getCodingStats);

module.exports = router;
