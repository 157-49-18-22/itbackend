const express = require('express');
const router = express.Router();
const documentationController = require('../controllers/documentation.controller');

const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', documentationController.getAllDocuments);
router.post('/', documentationController.createDocument);
router.get('/:id', documentationController.getDocumentById);
router.put('/:id', documentationController.updateDocument);
router.patch('/:id/views', documentationController.incrementViews);
router.delete('/:id', documentationController.deleteDocument);

module.exports = router;
