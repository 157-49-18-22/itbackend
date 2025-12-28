const express = require('express');
const router = express.Router();
const documentationController = require('../controllers/documentation.controller');

router.get('/', documentationController.getAllDocuments);
router.post('/', documentationController.createDocument);

module.exports = router;
