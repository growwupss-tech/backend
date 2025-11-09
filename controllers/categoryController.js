const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    let query = {};

    // Admin can see all categories, Seller can only see their own
    if (req.user.role === 'seller' && req.user.seller_id) {
      const sellerId = req.user.seller_id?._id || req.user.seller_id;
      query.seller_id = sellerId;
    }
    // Admin sees all categories (no filter)

    const categories = await Category.find(query);
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check access: Admin can access any, Seller can only access own
    if (req.user.role === 'seller' && req.user.seller_id) {
      const sellerId = req.user.seller_id?._id || req.user.seller_id;
      const categorySellerId = category.seller_id?._id || category.seller_id;
      if (sellerId.toString() !== categorySellerId.toString()) {
        return res.status(403).json({ message: 'Access denied. You can only access your own categories.' });
      }
    }
    // Admin can access any category

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
  try {
    // If seller_id not provided, use from authenticated user
    if (!req.body.seller_id) {
      if (req.user.role === 'admin') {
        return res.status(400).json({
          message: 'Admin must provide seller_id when creating category'
        });
      }
      if (req.user && req.user.seller_id) {
        req.body.seller_id = req.user.seller_id._id || req.user.seller_id;
      } else {
        return res.status(403).json({
          message: 'Access denied. You must have a seller profile to create a category.'
        });
      }
    } else {
      // Sellers can only create categories for themselves
      if (req.user.role === 'seller' && req.user.seller_id) {
        const sellerId = req.user.seller_id._id || req.user.seller_id;
        if (req.body.seller_id.toString() !== sellerId.toString()) {
          return res.status(403).json({
            message: 'Access denied. You can only create categories for yourself.'
          });
        }
      }
      // Admin can create categories for any seller
    }

    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category name already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
  try {
    const existingCategory = await Category.findById(req.params.id);

    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check access: Admin can update any, Seller can only update own
    if (req.user.role === 'seller' && req.user.seller_id) {
      const sellerId = req.user.seller_id._id || req.user.seller_id;
      const categorySellerId = existingCategory.seller_id?._id || existingCategory.seller_id;
      if (sellerId.toString() !== categorySellerId.toString()) {
        return res.status(403).json({ message: 'Access denied. You can only update your own categories.' });
      }
    }
    // Admin can update any category

    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category name already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check access: Admin can delete any, Seller can only delete own
    if (req.user.role === 'seller' && req.user.seller_id) {
      const sellerId = req.user.seller_id._id || req.user.seller_id;
      const categorySellerId = category.seller_id?._id || category.seller_id;
      if (sellerId.toString() !== categorySellerId.toString()) {
        return res.status(403).json({ message: 'Access denied. You can only delete your own categories.' });
      }
    }
    // Admin can delete any category

    await category.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};

