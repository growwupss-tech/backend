const Seller = require('../models/Seller');
const User = require('../models/User');

// @desc    Get all sellers
// @route   GET /api/sellers
// @access  Private
const getSellers = async (req, res) => {
  try {
    const sellers = await Seller.find();
    res.status(200).json({ success: true, count: sellers.length, data: sellers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single seller or current user's seller
// @route   GET /api/sellers/:id or GET /api/sellers/me
// @access  Private
const getSeller = async (req, res) => {
  try {
    let seller;

    // If requesting own seller profile
    if (req.params.id === 'me') {
      if (!req.user.seller_id) {
        return res.status(404).json({ message: 'You do not have a seller profile yet' });
      }
      seller = await Seller.findById(req.user.seller_id);
    } else {
      seller = await Seller.findById(req.params.id);
    }

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    res.status(200).json({ success: true, data: seller });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create seller and link to authenticated user
// @route   POST /api/sellers
// @access  Private
const createSeller = async (req, res) => {
  try {
    // Check if user already has a seller profile
    if (req.user.seller_id) {
      return res.status(400).json({ 
        message: 'User already has a seller profile. Use update endpoint to modify it.' 
      });
    }

    // Create seller
    const seller = await Seller.create(req.body);

    // Link seller to user
    req.user.seller_id = seller._id;
    await req.user.save();

    res.status(201).json({ 
      success: true, 
      data: seller,
      message: 'Seller profile created and linked to your account' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update seller (can update own seller or specific seller if admin)
// @route   PUT /api/sellers/:id or PUT /api/sellers/me
// @access  Private
const updateSeller = async (req, res) => {
  try {
    let sellerId = req.params.id;

    // If updating own seller profile
    if (req.params.id === 'me') {
      if (!req.user.seller_id) {
        return res.status(404).json({ message: 'You do not have a seller profile yet' });
      }
      sellerId = req.user.seller_id;
    } else {
      // Only allow users to update their own seller profile
      if (req.user.seller_id && req.user.seller_id.toString() !== sellerId) {
        return res.status(403).json({ message: 'You can only update your own seller profile' });
      }
    }

    const seller = await Seller.findByIdAndUpdate(sellerId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    res.status(200).json({ success: true, data: seller });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete seller (can delete own seller)
// @route   DELETE /api/sellers/:id or DELETE /api/sellers/me
// @access  Private
const deleteSeller = async (req, res) => {
  try {
    let sellerId = req.params.id;

    // If deleting own seller profile
    if (req.params.id === 'me') {
      if (!req.user.seller_id) {
        return res.status(404).json({ message: 'You do not have a seller profile yet' });
      }
      sellerId = req.user.seller_id;
    } else {
      // Only allow users to delete their own seller profile
      if (req.user.seller_id && req.user.seller_id.toString() !== sellerId) {
        return res.status(403).json({ message: 'You can only delete your own seller profile' });
      }
    }

    const seller = await Seller.findById(sellerId);

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Remove seller_id reference from user
    if (req.user.seller_id && req.user.seller_id.toString() === sellerId) {
      req.user.seller_id = null;
      await req.user.save();
    }

    await seller.deleteOne();
    res.status(200).json({ success: true, data: {}, message: 'Seller profile deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getSellers,
  getSeller,
  createSeller,
  updateSeller,
  deleteSeller,
};

