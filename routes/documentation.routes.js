const express = require('express');
const router = express.Router();
const documentationController = require('../controllers/documentation.controller');

const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', documentationController.getAllDocuments);
router.post('/', documentationController.createDocument);

module.exports = router;
