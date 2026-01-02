const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth.middleware');

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, '../uploads/prototypes');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const {
  createPrototype,
  getPrototypes,
  getPrototypeById,
  updatePrototype,
  deletePrototype,
  getPrototypeStats,
} = require('../controllers/prototype.controller');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      'prototype-' + uniqueSuffix + path.extname(file.originalname).toLowerCase()
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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
      new Error('Only image files (jpeg, jpg, png, gif) are allowed!')
    );
  },
}).single('image');

// Apply authentication middleware to all routes
router.use(protect);

// @route   POST /api/prototypes
// @desc    Create a new prototype
// @access  Private
router.post(
  '/',
  upload,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('projectId', 'Project ID is required').isInt(),
    check('version').optional().isString(),
    check('status').optional().isIn(['draft', 'in_progress', 'in_review', 'approved']),
    check('category').optional().isIn(['web', 'mobile', 'tablet', 'desktop']),
    check('link').optional().isURL().withMessage('Must be a valid URL'),
  ],
  createPrototype
);

// @route   GET /api/prototypes
// @desc    Get all prototypes with optional filtering
// @access  Private
router.get(
  '/',
  [
    check('projectId').optional().isInt(),
    check('search').optional().isString(),
    check('status').optional().isIn(['draft', 'in_progress', 'in_review', 'approved']),
    check('category').optional().isIn(['web', 'mobile', 'tablet', 'desktop']),
  ],
  getPrototypes
);

// @route   GET /api/prototypes/stats
// @desc    Get prototype statistics
// @access  Private
router.get(
  '/stats',
  [
    check('projectId').optional().isInt(),
  ],
  getPrototypeStats
);

// @route   GET /api/prototypes/:id
// @desc    Get a single prototype by ID
// @access  Private
router.get(
  '/:id',
  [
    check('id', 'Prototype ID is required').isInt(),
  ],
  getPrototypeById
);

// @route   PUT /api/prototypes/:id
// @desc    Update a prototype
// @access  Private
router.put(
  '/:id',
  upload,
  [
    check('id', 'Prototype ID is required').isInt(),
    check('title').optional().isString(),
    check('description').optional().isString(),
    check('version').optional().isString(),
    check('status').optional().isIn(['draft', 'in_progress', 'in_review', 'approved']),
    check('category').optional().isIn(['web', 'mobile', 'tablet', 'desktop']),
    check('link').optional().isURL().withMessage('Must be a valid URL'),
  ],
  updatePrototype
);

// @route   DELETE /api/prototypes/:id
// @desc    Delete a prototype
// @access  Private
router.delete(
  '/:id',
  [
    check('id', 'Prototype ID is required').isInt(),
  ],
  deletePrototype
);

module.exports = router;
