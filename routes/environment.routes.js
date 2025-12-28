const express = require('express');
const router = express.Router();
const environmentController = require('../controllers/environment.controller');

router.get('/', environmentController.getEnvironmentInfo);

module.exports = router;
