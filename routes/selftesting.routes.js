const express = require('express');
const router = express.Router();
const selfTestingController = require('../controllers/selftesting.controller');

router.get('/checklist', selfTestingController.getChecklist);

module.exports = router;
