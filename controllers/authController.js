const User = require('../models/User');
const Seller = require('../models/Seller');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { password, sellerInfo } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Please provide a password' });
    }

    let sellerId = null;

    // If seller info is provided, create seller first
    if (sellerInfo) {
      const { name, phone_number, whatsapp_number, address } = sellerInfo;
      
      if (!name || !phone_number || !whatsapp_number || !address) {
        return res.status(400).json({ 
          message: 'Please provide all seller information (name, phone_number, whatsapp_number, address)' 
        });
      }

      const seller = await Seller.create({
        name,
        phone_number,
        whatsapp_number,
        address,
      });

      sellerId = seller._id;
    }

    // Create user
    const user = await User.create({
      password,
      seller_id: sellerId,
    });

    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        seller_id: user.seller_id,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ message: 'Please provide user ID and password' });
    }

    // Check for user
    const user = await User.findById(userId).select('+password').populate('seller_id');

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
        seller_id: user.seller_id,
      },
    });
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
    const user = await User.findById(req.user._id).populate('seller_id');

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
  login,
  getMe,
};

