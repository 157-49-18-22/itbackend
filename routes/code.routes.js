const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const codeController = require('../../backend/controllers/code.controller');
const { protect } = require('../../backend/middleware/auth.middleware');
const validateRequest = require('../../backend/middleware/validateRequest.middleware');

// Validation rules
const createCodeFileValidation = [
  check('name').notEmpty().withMessage('File name is required'),
  check('projectId').isInt().withMessage('Project ID must be a valid integer')
];

const updateCodeFileValidation = [
  check('name').optional().notEmpty().withMessage('File name cannot be empty'),
  check('language').optional().isIn(['javascript', 'typescript', 'css', 'html', 'json', 'python', 'java'])
    .withMessage('Invalid language specified')
];

// Apply auth middleware to all routes
router.use(protect);

// Get all code files for a project
router.get('/project/:projectId', (req, res) => codeController.getProjectCodeFiles(req, res));

// Search code files
router.get('/search/:projectId', (req, res) => codeController.searchCodeFiles(req, res));

// Get a single code file
router.get('/:id', (req, res) => codeController.getCodeFile(req, res));

// Create a new code file
router.post('/', [...createCodeFileValidation, validateRequest], (req, res) => codeController.createCodeFile(req, res));

// Update a code file
router.put('/:id', [...updateCodeFileValidation, validateRequest], (req, res) => codeController.updateCodeFile(req, res));

// Delete a code file
router.delete('/:id', (req, res) => codeController.deleteCodeFile(req, res));

module.exports = router;
