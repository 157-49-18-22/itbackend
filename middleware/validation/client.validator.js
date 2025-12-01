const { body, param } = require('express-validator');

// Validation rules for client operations
const clientValidationRules = {
  // Create client validation
  create: [
    body('name')
      .trim()
      .notEmpty().withMessage('Company name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Company name must be between 2 and 100 characters'),
    
    body('contact')
      .trim()
      .notEmpty().withMessage('Contact person name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Contact name must be between 2 and 100 characters'),
    
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please provide a valid email')
      .normalizeEmail(),
    
    body('phone')
      .optional({ checkFalsy: true })
      .isMobilePhone().withMessage('Please provide a valid phone number'),
    
    body('company')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 100 }).withMessage('Company name is too long'),
    
    body('status')
      .optional()
      .isIn(['Active', 'Inactive', 'Prospect']).withMessage('Invalid status value'),
    
    body('address')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 500 }).withMessage('Address is too long')
  ],

  // Update client validation
  update: [
    param('id')
      .isInt().withMessage('Invalid client ID')
      .toInt(),
    
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('Company name must be between 2 and 100 characters'),
    
    body('contact')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('Contact name must be between 2 and 100 characters'),
    
    body('email')
      .optional()
      .trim()
      .isEmail().withMessage('Please provide a valid email')
      .normalizeEmail(),
    
    body('phone')
      .optional({ checkFalsy: true })
      .isMobilePhone().withMessage('Please provide a valid phone number'),
    
    body('company')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 100 }).withMessage('Company name is too long'),
    
    body('status')
      .optional()
      .isIn(['Active', 'Inactive', 'Prospect']).withMessage('Invalid status value'),
    
    body('address')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 500 }).withMessage('Address is too long')
  ],

  // ID parameter validation
  idParam: [
    param('id')
      .isInt().withMessage('Invalid client ID')
      .toInt()
  ],

  // Search query validation
  search: [
    param('query')
      .trim()
      .notEmpty().withMessage('Search query is required')
      .isLength({ min: 2 }).withMessage('Search query must be at least 2 characters')
  ]
};

module.exports = clientValidationRules;
