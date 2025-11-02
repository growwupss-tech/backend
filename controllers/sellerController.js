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

// @desc    Get single seller
// @route   GET /api/sellers/:id
// @access  Private
const getSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    res.status(200).json({ success: true, data: seller });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create seller
// @route   POST /api/sellers
// @access  Private
const createSeller = async (req, res) => {
  try {
    const seller = await Seller.create(req.body);
    res.status(201).json({ success: true, data: seller });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update seller
// @route   PUT /api/sellers/:id
// @access  Private
const updateSeller = async (req, res) => {
  try {
    const seller = await Seller.findByIdAndUpdate(req.params.id, req.body, {
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

// @desc    Delete seller
// @route   DELETE /api/sellers/:id
// @access  Private
const deleteSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    await seller.deleteOne();
    res.status(200).json({ success: true, data: {} });
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

