const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const {
  generateOTP,
  getOTPExpiration,
  verifyOTP,
  sendOTPViaSMS,
  sendOTPViaEmail,
} = require('../utils/otpService');

// Initialize Google OAuth client (only if GOOGLE_CLIENT_ID is provided)
let client = null;
if (process.env.GOOGLE_CLIENT_ID) {
  client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
}

// @desc    Register user with email and password (sends OTP)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Generate OTP
    const otpCode = generateOTP();
    const otpExpiresAt = getOTPExpiration(10);

    // Create user with unverified status
    const user = await User.create({
      email,
      password,
      emailVerified: false,
      otp: {
        code: otpCode,
        expiresAt: otpExpiresAt,
      },
    });

    // Send OTP via email
    await sendOTPViaEmail(email, otpCode);

    res.status(201).json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete registration.',
      userId: user._id,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify email OTP and complete registration
// @route   POST /api/auth/verify-email-otp
// @access  Public
const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Please provide email and OTP' });
    }

    const user = await User.findOne({ email }).select('+otp.code +otp.expiresAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.otp || !user.otp.code) {
      return res.status(400).json({ message: 'No OTP found. Please request a new OTP.' });
    }

    const isValid = verifyOTP(user.otp.code, user.otp.expiresAt, otp);

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark email as verified and clear OTP
    user.emailVerified = true;
    user.otp = undefined;
    await user.save();

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        seller_id: user.seller_id,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login user with email and password
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for user by email
    const user = await User.findOne({ email }).select('+password').populate('seller_id');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        seller_id: user.seller_id,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Register/Login with phone number (sends OTP)
// @route   POST /api/auth/phone/send-otp
// @access  Public
const sendPhoneOTP = async (req, res) => {
  try {
    const { phone, email } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Please provide phone number' });
    }

    // Email is required for phone signup
    if (!email) {
      return res.status(400).json({ message: 'Please provide email for phone signup' });
    }

    // Generate OTP
    const otpCode = generateOTP();
    const otpExpiresAt = getOTPExpiration(10);

    // Check if user exists
    let user = await User.findOne({ phone });

    if (user) {
      // Update OTP for existing user
      user.otp = {
        code: otpCode,
        expiresAt: otpExpiresAt,
      };
      // Update email if provided and different
      if (email && email !== user.email) {
        user.email = email;
      }
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        phone,
        email,
        phoneVerified: false,
        emailVerified: false,
        otp: {
          code: otpCode,
          expiresAt: otpExpiresAt,
        },
      });
    }

    // Send OTP via SMS
    await sendOTPViaSMS(phone, otpCode);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your phone number',
      userId: user._id,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Phone number or email already exists' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify phone OTP and complete registration/login
// @route   POST /api/auth/phone/verify-otp
// @access  Public
const verifyPhoneOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Please provide phone number and OTP' });
    }

    const user = await User.findOne({ phone }).select('+otp.code +otp.expiresAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.otp || !user.otp.code) {
      return res.status(400).json({ message: 'No OTP found. Please request a new OTP.' });
    }

    const isValid = verifyOTP(user.otp.code, user.otp.expiresAt, otp);

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark phone as verified and clear OTP
    user.phoneVerified = true;
    user.otp = undefined;
    await user.save();

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: 'Phone verified successfully',
      token,
      user: {
        _id: user._id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        seller_id: user.seller_id,
        phoneVerified: user.phoneVerified,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login/Register with Google
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Please provide Google ID token' });
    }

    if (!client || !process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID in environment variables.' });
    }

    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists
    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    }).populate('seller_id');

    if (user) {
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        googleId,
        email,
        emailVerified: true, // Google emails are pre-verified
        role: 'visitor',
      });
    }

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        seller_id: user.seller_id,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ message: 'Please provide email or phone number' });
    }

    let user;
    if (phone) {
      user = await User.findOne({ phone }).select('+otp.code +otp.expiresAt');
    } else {
      user = await User.findOne({ email }).select('+otp.code +otp.expiresAt');
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new OTP
    const otpCode = generateOTP();
    const otpExpiresAt = getOTPExpiration(10);

    user.otp = {
      code: otpCode,
      expiresAt: otpExpiresAt,
    };
    await user.save();

    // Send OTP
    if (phone) {
      await sendOTPViaSMS(phone, otpCode);
      res.status(200).json({
        success: true,
        message: 'OTP resent to your phone number',
      });
    } else {
      await sendOTPViaEmail(email, otpCode);
      res.status(200).json({
        success: true,
        message: 'OTP resent to your email',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -otp')
      .populate('seller_id');

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  register,
  verifyEmailOTP,
  login,
  sendPhoneOTP,
  verifyPhoneOTP,
  googleAuth,
  resendOTP,
  getMe,
};
