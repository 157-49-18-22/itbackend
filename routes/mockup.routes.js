const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  createMockup,
  getMockups,
  getMockupById,
  updateMockup,
  deleteMockup,
  getMockupStats
} = require('../controllers/mockup.controller');

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, '../../uploads/mockups');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      'mockup-' + uniqueSuffix + path.extname(file.originalname).toLowerCase()
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(
      new Error(
        'Invalid file type. Only jpg, jpeg, png, and gif are allowed.'
      )
    );
  }
});

// Apply authentication middleware to all routes
router.use(protect);

// @route   POST /api/mockups
// @desc    Create a new mockup
// @access  Private
router.post(
  '/',
  upload.single('image'),
  [
    check('title', 'Title is required').not().isEmpty(),
    check('projectId', 'Project ID is required').isInt(),
    check('category', 'Category is required').not().isEmpty(),
  ],
  createMockup
);

// @route   GET /api/mockups
// @desc    Get all mockups with optional filtering
// @access  Private
router.get('/', getMockups);

// @route   GET /api/mockups/stats/:projectId
// @desc    Get mockup statistics for a project
// @access  Private
router.get('/stats/:projectId', getMockupStats);

// @route   GET /api/mockups/:id
// @desc    Get a single mockup by ID
// @access  Private
router.get('/:id', getMockupById);

// @route   PUT /api/mockups/:id
// @desc    Update a mockup
// @access  Private
router.put(
  '/:id',
  upload.single('image'),
  [
    check('title', 'Title is required').optional().not().isEmpty(),
    check('status', 'Invalid status').optional().isIn(['draft', 'in_review', 'approved', 'rejected']),
  ],
  updateMockup
);

// @route   DELETE /api/mockups/:id
// @desc    Delete a mockup
// @access  Private
router.delete('/:id', authorize('admin'), deleteMockup);

module.exports = router;
