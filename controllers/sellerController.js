const Seller = require('../models/Seller');
const User = require('../models/User');

// @desc    Get all sellers (admin only) or own seller (seller)
// @route   GET /api/sellers
// @access  Private - Admin only for all sellers
const getSellers = async (req, res) => {
  try {
    // Admin can see all sellers
    if (req.user.role === 'admin') {
      const sellers = await Seller.find();
      return res.status(200).json({ success: true, count: sellers.length, data: sellers });
    }
    
    // Sellers can only see their own seller profile
    if (req.user.role === 'seller' && req.user.seller_id) {
      const seller = await Seller.findById(req.user.seller_id);
      if (!seller) {
        return res.status(404).json({ message: 'Seller profile not found' });
      }
      return res.status(200).json({ success: true, count: 1, data: [seller] });
    }
    
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single seller or current user's seller
// @route   GET /api/sellers/:id or GET /api/sellers/me
// @access  Private - Admin can access any, Seller can only access own
const getSeller = async (req, res) => {
  try {
    let seller;
    const sellerId = req.params.id === 'me' ? req.user.seller_id : req.params.id;

    // If requesting own seller profile
    if (req.params.id === 'me') {
      if (!req.user.seller_id) {
        return res.status(404).json({ message: 'You do not have a seller profile yet' });
      }
      seller = await Seller.findById(req.user.seller_id);
    } else {
      // Admin can access any seller
      if (req.user.role === 'admin') {
        seller = await Seller.findById(req.params.id);
      } else {
        // Sellers can only access their own seller profile
        if (req.user.role !== 'seller' || !req.user.seller_id) {
          return res.status(403).json({ message: 'Access denied. You can only access your own seller profile.' });
        }
        
        // Check if requesting own seller
        const userSellerId = req.user.seller_id._id || req.user.seller_id;
        if (req.params.id.toString() !== userSellerId.toString()) {
          return res.status(403).json({ message: 'Access denied. You can only access your own seller profile.' });
        }
        
        seller = await Seller.findById(req.params.id);
      }
    }

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    res.status(200).json({ success: true, data: seller });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create seller and link to authenticated user (upgrades visitor to seller)
// @route   POST /api/sellers
// @access  Private - Seller role required (visitor becomes seller after purchase)
const createSeller = async (req, res) => {
  try {
    // Check if user already has a seller profile
    if (req.user.seller_id) {
      return res.status(400).json({ 
        message: 'User already has a seller profile. Use update endpoint to modify it.' 
      });
    }

    // Only visitors and sellers can create seller profile (admin doesn't need this)
    if (req.user.role !== 'visitor' && req.user.role !== 'seller') {
      return res.status(403).json({ 
        message: 'Access denied. Only visitors and sellers can create seller profiles.' 
      });
    }

    // Create seller
    const seller = await Seller.create(req.body);

    // Link seller to user and upgrade role to seller
    req.user.seller_id = seller._id;
    if (req.user.role === 'visitor') {
      req.user.role = 'seller';
    }
    await req.user.save();

    res.status(201).json({ 
      success: true, 
      data: seller,
      message: 'Seller profile created and linked to your account. Your role has been upgraded to seller.' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update seller (admin can update any, seller can only update own)
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
      // Admin can update any seller
      if (req.user.role === 'admin') {
        sellerId = req.params.id;
      } else {
        // Sellers can only update their own seller profile
        if (req.user.role !== 'seller' || !req.user.seller_id) {
          return res.status(403).json({ message: 'Access denied. You can only update your own seller profile.' });
        }
        
        const userSellerId = req.user.seller_id._id || req.user.seller_id;
        if (req.params.id.toString() !== userSellerId.toString()) {
          return res.status(403).json({ message: 'Access denied. You can only update your own seller profile.' });
        }
        sellerId = req.params.id;
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

// @desc    Delete seller (admin can delete any, seller can only delete own)
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
      // Admin can delete any seller
      if (req.user.role === 'admin') {
        sellerId = req.params.id;
      } else {
        // Sellers can only delete their own seller profile
        if (req.user.role !== 'seller' || !req.user.seller_id) {
          return res.status(403).json({ message: 'Access denied. You can only delete your own seller profile.' });
        }
        
        const userSellerId = req.user.seller_id._id || req.user.seller_id;
        if (req.params.id.toString() !== userSellerId.toString()) {
          return res.status(403).json({ message: 'Access denied. You can only delete your own seller profile.' });
        }
        sellerId = req.params.id;
      }
    }

    const seller = await Seller.findById(sellerId);

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Remove seller_id reference from user and downgrade role to visitor
    const userSellerId = req.user.seller_id?._id || req.user.seller_id;
    if (userSellerId && userSellerId.toString() === sellerId.toString()) {
      req.user.seller_id = null;
      if (req.user.role === 'seller') {
        req.user.role = 'visitor';
      }
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

