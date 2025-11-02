const Business = require('../models/Business');

// @desc    Get all businesses
// @route   GET /api/businesses
// @access  Private
const getBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find().populate('seller_id').populate('site_id');
    res.status(200).json({ success: true, count: businesses.length, data: businesses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get businesses by seller
// @route   GET /api/businesses/seller/:sellerId
// @access  Private
const getBusinessesBySeller = async (req, res) => {
  try {
    const businesses = await Business.find({ seller_id: req.params.sellerId })
      .populate('seller_id')
      .populate('site_id');
    res.status(200).json({ success: true, count: businesses.length, data: businesses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single business
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

    res.status(200).json({ success: true, data: business });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create business
// @route   POST /api/businesses
// @access  Private
const createBusiness = async (req, res) => {
  try {
    // If seller_id not provided, use from authenticated user
    if (!req.body.seller_id && req.user && req.user.seller_id) {
      req.body.seller_id = req.user.seller_id._id;
    }

    const business = await Business.create(req.body);
    res.status(201).json({ success: true, data: business });
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

