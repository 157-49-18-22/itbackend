const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performance.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes protected by default
// router.use(protect); // Uncomment if auth middleware exists and is needed

router.get('/', performanceController.getPerformanceTests);
router.post('/run', performanceController.createPerformanceTest); // 'run' implies execution
router.get('/:id', performanceController.getPerformanceTestById);

module.exports = router;
