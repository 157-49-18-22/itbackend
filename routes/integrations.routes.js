const express = require('express');
const router = express.Router();
const integrationsController = require('../controllers/integrations.controller');

router.get('/status', integrationsController.getIntegrationsStatus);

module.exports = router;
