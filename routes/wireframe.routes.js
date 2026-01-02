const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth.middleware');

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, '../../uploads/wireframes');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
const {
  createWireframe,
  getWireframes,
  getWireframeById,
  updateWireframe,
  deleteWireframe,
  getWireframeStats,
} = require('../controllers/wireframe.controller');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      'wireframe-' + uniqueSuffix + path.extname(file.originalname).toLowerCase()
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only image files are allowed.'));
  }
}).single('image');

// Apply authentication middleware to all routes
router.use(protect);

// @route   POST /api/wireframes
// @desc    Create a new wireframe
// @access  Private
router.post(
  '/',
  (req, res, next) => {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  [
    check('title', 'Title is required').not().isEmpty(),
    check('projectId', 'Project ID is required').isInt(),
  ],
  createWireframe
);

// @route   GET /api/wireframes
// @desc    Get all wireframes with optional filtering
// @access  Private
router.get('/', getWireframes);

// @route   GET /api/wireframes/stats/:projectId
// @desc    Get wireframe statistics for a project
// @access  Private
router.get('/stats/:projectId', getWireframeStats);

// @route   GET /api/wireframes/:id
// @desc    Get a single wireframe by ID
// @access  Private
router.get('/:id', getWireframeById);

// @route   PUT /api/wireframes/:id
// @desc    Update a wireframe
// @access  Private
router.put(
  '/:id',
  (req, res, next) => {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  [
    check('title', 'Title is required').optional().not().isEmpty(),
    check('status', 'Invalid status').optional().isIn([
      'draft',
      'in_progress',
      'in_review',
      'approved',
    ]),
    check('category', 'Invalid category')
      .optional()
      .isIn(['web', 'mobile', 'tablet', 'desktop']),
  ],
  updateWireframe
);

// @route   DELETE /api/wireframes/:id
// @desc    Delete a wireframe
// @access  Private
router.delete('/:id', deleteWireframe);

module.exports = router;
