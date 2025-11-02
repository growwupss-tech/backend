const Analytics = require('../models/Analytics');
const Business = require('../models/Business');

// @desc    Get all analytics
// @route   GET /api/analytics
// @access  Private
const getAnalytics = async (req, res) => {
  try {
    const { business_id } = req.query;
    let query = {};

    if (business_id) {
      query.business_id = business_id;
    }

    const analytics = await Analytics.find(query)
      .populate('business_id')
      .populate('product_ids');
    
    res.status(200).json({ success: true, count: analytics.length, data: analytics });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single analytics record
// @route   GET /api/analytics/:id
// @access  Private
const getAnalytic = async (req, res) => {
  try {
    const analytic = await Analytics.findById(req.params.id)
      .populate('business_id')
      .populate('product_ids');

    if (!analytic) {
      return res.status(404).json({ message: 'Analytics record not found' });
    }

    res.status(200).json({ success: true, data: analytic });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create analytics record
// @route   POST /api/analytics
// @access  Private
const createAnalytic = async (req, res) => {
  try {
    const analytic = await Analytics.create(req.body);
    const populatedAnalytic = await Analytics.findById(analytic._id)
      .populate('business_id')
      .populate('product_ids');
    res.status(201).json({ success: true, data: populatedAnalytic });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update analytics record
// @route   PUT /api/analytics/:id
// @access  Private
const updateAnalytic = async (req, res) => {
  try {
    const analytic = await Analytics.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('business_id')
      .populate('product_ids');

    if (!analytic) {
      return res.status(404).json({ message: 'Analytics record not found' });
    }

    res.status(200).json({ success: true, data: analytic });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete analytics record
// @route   DELETE /api/analytics/:id
// @access  Private
const deleteAnalytic = async (req, res) => {
  try {
    const analytic = await Analytics.findById(req.params.id);

    if (!analytic) {
      return res.status(404).json({ message: 'Analytics record not found' });
    }

    await analytic.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get analytics by business
// @route   GET /api/analytics/business/:businessId
// @access  Private
const getAnalyticsByBusiness = async (req, res) => {
  try {
    const analytics = await Analytics.find({ business_id: req.params.businessId })
      .populate('business_id')
      .populate('product_ids');
    
    res.status(200).json({ success: true, count: analytics.length, data: analytics });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Increment views
// @route   PUT /api/analytics/:id/views
// @access  Public/Private
const incrementViews = async (req, res) => {
  try {
    const analytic = await Analytics.findById(req.params.id);

    if (!analytic) {
      return res.status(404).json({ message: 'Analytics record not found' });
    }

    analytic.views += 1;
    await analytic.save();

    res.status(200).json({ success: true, data: analytic });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Increment clicks
// @route   PUT /api/analytics/:id/clicks
// @access  Public/Private
const incrementClicks = async (req, res) => {
  try {
    const analytic = await Analytics.findById(req.params.id);

    if (!analytic) {
      return res.status(404).json({ message: 'Analytics record not found' });
    }

    analytic.clicks += 1;
    await analytic.save();

    res.status(200).json({ success: true, data: analytic });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAnalytics,
  getAnalytic,
  createAnalytic,
  updateAnalytic,
  deleteAnalytic,
  getAnalyticsByBusiness,
  incrementViews,
  incrementClicks,
};

