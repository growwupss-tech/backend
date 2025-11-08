const Business = require('../models/Business');

// @desc    Get all businesses (admin sees all, seller sees own)
// @route   GET /api/businesses
// @access  Private
const getBusinesses = async (req, res) => {
  try {
    let businesses;
    
    // Admin can see all businesses
    if (req.user.role === 'admin') {
      businesses = await Business.find().populate('seller_id').populate('site_id');
    } else if (req.user.role === 'seller' && req.user.seller_id) {
      // Sellers can only see their own businesses
      const sellerId = req.user.seller_id._id || req.user.seller_id;
      businesses = await Business.find({ seller_id: sellerId })
        .populate('seller_id')
        .populate('site_id');
    } else {
      return res.status(403).json({ message: 'Access denied. Seller privileges required.' });
    }
    
    res.status(200).json({ success: true, count: businesses.length, data: businesses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get businesses by seller (admin can see any, seller can only see own)
// @route   GET /api/businesses/seller/:sellerId
// @access  Private
const getBusinessesBySeller = async (req, res) => {
  try {
    let sellerId = req.params.sellerId;
    
    // Admin can see any seller's businesses
    if (req.user.role === 'admin') {
      // Use provided sellerId
    } else if (req.user.role === 'seller' && req.user.seller_id) {
      // Sellers can only see their own businesses
      const userSellerId = req.user.seller_id._id || req.user.seller_id;
      if (req.params.sellerId.toString() !== userSellerId.toString()) {
        return res.status(403).json({ 
          message: 'Access denied. You can only view your own businesses.' 
        });
      }
      sellerId = userSellerId;
    } else {
      return res.status(403).json({ message: 'Access denied. Seller privileges required.' });
    }
    
    const businesses = await Business.find({ seller_id: sellerId })
      .populate('seller_id')
      .populate('site_id');
    res.status(200).json({ success: true, count: businesses.length, data: businesses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single business (admin can see any, seller can only see own)
// @route   GET /api/businesses/:id
// @access  Private
const getBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id)
      .populate('seller_id')
      .populate('site_id');

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Admin can see any business
    if (req.user.role === 'admin') {
      return res.status(200).json({ success: true, data: business });
    }
    
    // Sellers can only see their own businesses
    if (req.user.role === 'seller' && req.user.seller_id) {
      const sellerId = req.user.seller_id._id || req.user.seller_id;
      if (business.seller_id.toString() !== sellerId.toString()) {
        return res.status(403).json({ 
          message: 'Access denied. You can only view your own businesses.' 
        });
      }
    } else {
      return res.status(403).json({ message: 'Access denied. Seller privileges required.' });
    }

    res.status(200).json({ success: true, data: business });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create business (sellers can create, admin can create for any seller)
// @route   POST /api/businesses
// @access  Private - Seller role required
const createBusiness = async (req, res) => {
  try {
    // If seller_id not provided, use from authenticated user
    if (!req.body.seller_id) {
      if (req.user.role === 'admin') {
        return res.status(400).json({ 
          message: 'Admin must provide seller_id when creating business' 
        });
      }
      if (req.user && req.user.seller_id) {
        req.body.seller_id = req.user.seller_id._id || req.user.seller_id;
      } else {
        return res.status(403).json({ 
          message: 'Access denied. You must have a seller profile to create a business.' 
        });
      }
    } else {
      // Sellers can only create businesses for themselves
      if (req.user.role === 'seller' && req.user.seller_id) {
        const sellerId = req.user.seller_id._id || req.user.seller_id;
        if (req.body.seller_id.toString() !== sellerId.toString()) {
          return res.status(403).json({ 
            message: 'Access denied. You can only create businesses for yourself.' 
          });
        }
      }
      // Admin can create businesses for any seller
    }

    const business = await Business.create(req.body);
    const populatedBusiness = await Business.findById(business._id)
      .populate('seller_id')
      .populate('site_id');
    res.status(201).json({ success: true, data: populatedBusiness });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update business
// @route   PUT /api/businesses/:id
// @access  Private
const updateBusiness = async (req, res) => {
  try {
    const business = await Business.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('seller_id').populate('site_id');

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.status(200).json({ success: true, data: business });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete business
// @route   DELETE /api/businesses/:id
// @access  Private
const deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    await business.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getBusinesses,
  getBusinessesBySeller,
  getBusiness,
  createBusiness,
  updateBusiness,
  deleteBusiness,
};

