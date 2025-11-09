const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmailOTP,
  login,
  sendPhoneOTP,
  verifyPhoneOTP,
  googleAuth,
  resendOTP,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Email/Password authentication
router.post('/register', register);
router.post('/verify-email-otp', verifyEmailOTP);
router.post('/login', login);

// Phone number authentication
router.post('/phone/send-otp', sendPhoneOTP);
router.post('/phone/verify-otp', verifyPhoneOTP);

// Google authentication
router.post('/google', googleAuth);

// Resend OTP
router.post('/resend-otp', resendOTP);

// Get current user
router.get('/me', protect, getMe);

module.exports = router;
