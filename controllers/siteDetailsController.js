const Site_Details = require('../models/Site_Details');
const Business = require('../models/Business');

// @desc    Get all site details
// @route   GET /api/site-details
// @access  Private
const getSiteDetails = async (req, res) => {
  try {
    let sites;

    // Admin can see all site details, Seller can only see their own (through business)
    if (req.user.role === 'admin') {
      sites = await Site_Details.find()
        .populate('hero_slide_ids')
        .populate('product_ids')
        .populate('story_ids')
        .populate('category_ids');
    } else if (req.user.role === 'seller' && req.user.seller_id) {
      // Find businesses belonging to this seller
      const sellerId = req.user.seller_id._id || req.user.seller_id;
      const businesses = await Business.find({ seller_id: sellerId }).select('site_id');
      const siteIds = businesses.map(b => b.site_id).filter(id => id);
      
      if (siteIds.length === 0) {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }

      sites = await Site_Details.find({ _id: { $in: siteIds } })
        .populate('hero_slide_ids')
        .populate('product_ids')
        .populate('story_ids')
        .populate('category_ids');
    } else {
      return res.status(403).json({ message: 'Access denied. Seller privileges required.' });
    }

    res.status(200).json({ success: true, count: sites.length, data: sites });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single site detail
// @route   GET /api/site-details/:id
// @access  Private
const getSiteDetail = async (req, res) => {
  try {
    const site = await Site_Details.findById(req.params.id)
      .populate('hero_slide_ids')
      .populate('product_ids')
      .populate('story_ids')
      .populate('category_ids');

    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }

    // Check access: Admin can access any, Seller can only access own (through business)
    if (req.user.role === 'seller' && req.user.seller_id) {
      const sellerId = req.user.seller_id._id || req.user.seller_id;
      const business = await Business.findOne({ site_id: req.params.id, seller_id: sellerId });
      
      if (!business) {
        return res.status(403).json({ message: 'Access denied. You can only access your own site details.' });
      }
    }
    // Admin can access any site detail

    res.status(200).json({ success: true, data: site });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create site detail
// @route   POST /api/site-details
// @access  Private
const createSiteDetail = async (req, res) => {
  try {
    const site = await Site_Details.create(req.body);
    res.status(201).json({ success: true, data: site });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update site detail
// @route   PUT /api/site-details/:id
// @access  Private
const updateSiteDetail = async (req, res) => {
  try {
    const site = await Site_Details.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('hero_slide_ids')
      .populate('product_ids')
      .populate('story_ids')
      .populate('category_ids');

    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }

    res.status(200).json({ success: true, data: site });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete site detail
// @route   DELETE /api/site-details/:id
// @access  Private
const deleteSiteDetail = async (req, res) => {
  try {
    const site = await Site_Details.findById(req.params.id);

    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }

    await site.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add hero slide to site
// @route   PUT /api/site-details/:id/hero-slides
// @access  Private
const addHeroSlide = async (req, res) => {
  try {
    const { hero_slide_id } = req.body;
    const site = await Site_Details.findById(req.params.id);

    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }

    if (!site.hero_slide_ids.includes(hero_slide_id)) {
      site.hero_slide_ids.push(hero_slide_id);
      await site.save();
    }

    const updatedSite = await Site_Details.findById(req.params.id).populate('hero_slide_ids');
    res.status(200).json({ success: true, data: updatedSite });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Remove hero slide from site
// @route   DELETE /api/site-details/:id/hero-slides/:heroSlideId
// @access  Private
const removeHeroSlide = async (req, res) => {
  try {
    const site = await Site_Details.findById(req.params.id);

    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }

    site.hero_slide_ids = site.hero_slide_ids.filter(
      id => id.toString() !== req.params.heroSlideId
    );
    await site.save();

    const updatedSite = await Site_Details.findById(req.params.id).populate('hero_slide_ids');
    res.status(200).json({ success: true, data: updatedSite });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getSiteDetails,
  getSiteDetail,
  createSiteDetail,
  updateSiteDetail,
  deleteSiteDetail,
  addHeroSlide,
  removeHeroSlide,
};

