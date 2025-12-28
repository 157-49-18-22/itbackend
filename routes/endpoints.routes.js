const express = require('express');
const router = express.Router();
const endpointsController = require('../controllers/endpoints.controller');

router.get('/', endpointsController.getEndpoints);

module.exports = router;
