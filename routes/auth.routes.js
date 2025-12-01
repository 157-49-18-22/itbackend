const express = require('express');
const router = express.Router();
const {
  login,
  getMe,
  logout,
  refreshToken,
  updatePassword
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Registration is now handled by team controller with admin protection
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/refresh-token', refreshToken);
router.put('/update-password', protect, updatePassword);

module.exports = router;
