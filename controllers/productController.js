const Products = require('../models/Products');
const { deleteMultipleFromCloudinary, extractPublicId } = require('../config/cloudinary');

// @desc    Get all products
// @route   GET /api/products
// @access  Private/Public
const getProducts = async (req, res) => {
  try {
    const { is_visible, category_id } = req.query;
    let query = {};

    // Admin can see all products, Seller can only see their own
    if (req.user.role === 'seller' && req.user.seller_id) {
      const sellerId = req.user.seller_id?._id || req.user.seller_id;
      if (sellerId) {
        query.seller_id = sellerId;
      }
    }
    // Admin sees all products (no filter)

    if (is_visible !== undefined) {
      query.is_visible = is_visible === 'true';
    }

    if (category_id) {
      query.category_id = category_id;
    }

    const products = await Products.find(query)
      .populate('category_id')
      .populate('attribute_ids');
    
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private/Public
const getProduct = async (req, res) => {
  try {
    const product = await Products.findById(req.params.id)
      .populate('category_id')
      .populate('attribute_ids');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check access: Admin can access any, Seller can only access own
    if (req.user.role === 'seller' && req.user.seller_id) {
      const sellerId = req.user.seller_id?._id || req.user.seller_id;
      const productSellerId = product.seller_id?._id || product.seller_id;
      if (sellerId.toString() !== productSellerId.toString()) {
        return res.status(403).json({ message: 'Access denied. You can only access your own products.' });
      }
    }
    // Admin can access any product

    // Increment visits
    product.visits += 1;
    await product.save();

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
  try {
    // If seller_id not provided, use from authenticated user
    if (!req.body.seller_id) {
      if (req.user.role === 'admin') {
        return res.status(400).json({
          message: 'Admin must provide seller_id when creating product'
        });
      }
      if (req.user && req.user.seller_id) {
        req.body.seller_id = req.user.seller_id._id || req.user.seller_id;
      } else {
        return res.status(403).json({
          message: 'Access denied. You must have a seller profile to create a product.'
        });
      }
    } else {
      // Sellers can only create products for themselves
      if (req.user.role === 'seller' && req.user.seller_id) {
        const sellerId = req.user.seller_id._id || req.user.seller_id;
        if (req.body.seller_id.toString() !== sellerId.toString()) {
          return res.status(403).json({
            message: 'Access denied. You can only create products for yourself.'
          });
        }
      }
      // Admin can create products for any seller
    }

    // Parse attribute_ids if it's a string
    if (req.body.attribute_ids !== undefined) {
      if (typeof req.body.attribute_ids === 'string') {
        try {
          // Try to parse if it's a JSON string
          req.body.attribute_ids = JSON.parse(req.body.attribute_ids);
        } catch (e) {
          // If parsing fails, treat as single value or split by comma
          req.body.attribute_ids = req.body.attribute_ids.split(',').map(id => id.trim()).filter(id => id);
        }
      }
      // Ensure it's an array and filter out empty values
      if (!Array.isArray(req.body.attribute_ids)) {
        req.body.attribute_ids = [];
      }
      req.body.attribute_ids = req.body.attribute_ids.filter(id => id && id.toString().trim() !== '');
    } else {
      req.body.attribute_ids = [];
    }

    // Get URLs from uploaded files that were processed by uploadBase64 middleware
    const imageUrls = [];
    if (req.uploadedFiles && req.uploadedFiles.length > 0) {
      req.uploadedFiles.forEach((file) => {
        imageUrls.push(file.url);
      });
    }

    // Merge uploaded images with any URLs sent in body
    const allImages = imageUrls.concat(req.body.images || []);

    const productData = {
      ...req.body,
      images: allImages.length > 0 ? allImages : undefined,
    };

    const product = await Products.create(productData);
    const populatedProduct = await Products.findById(product._id)
      .populate('category_id')
      .populate('attribute_ids');
    res.status(201).json({ success: true, data: populatedProduct });
  } catch (error) {
    // If product creation fails, delete uploaded files
    if (req.files && req.files.length > 0) {
      try {
        await deleteMultipleFromCloudinary(req.files.map(f => f.path));
      } catch (deleteError) {
      }
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res) => {
  try {
    const existingProduct = await Products.findById(req.params.id);
    
    if (!existingProduct) {
      // Clean up uploaded files if product doesn't exist
      if (req.files && req.files.length > 0) {
        try {
          await deleteMultipleFromCloudinary(req.files.map(f => f.path));
        } catch (deleteError) {
        }
      }
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check access: Admin can update any, Seller can only update own
    if (req.user.role === 'seller' && req.user.seller_id) {
      const sellerId = req.user.seller_id._id || req.user.seller_id;
      const productSellerId = existingProduct.seller_id?._id || existingProduct.seller_id;
      if (sellerId.toString() !== productSellerId.toString()) {
        // Clean up uploaded files
        if (req.files && req.files.length > 0) {
          try {
            await deleteMultipleFromCloudinary(req.files.map(f => f.path));
          } catch (deleteError) {
          }
        }
        return res.status(403).json({ message: 'Access denied. You can only update your own products.' });
      }
    }
    // Admin can update any product

    // Parse attribute_ids if it's a string
    if (req.body.attribute_ids !== undefined) {
      if (typeof req.body.attribute_ids === 'string') {
        try {
          // Try to parse if it's a JSON string
          req.body.attribute_ids = JSON.parse(req.body.attribute_ids);
        } catch (e) {
          // If parsing fails, treat as single value or split by comma
          req.body.attribute_ids = req.body.attribute_ids.split(',').map(id => id.trim()).filter(id => id);
        }
      }
      // Ensure it's an array and filter out empty values
      if (!Array.isArray(req.body.attribute_ids)) {
        req.body.attribute_ids = [];
      }
      req.body.attribute_ids = req.body.attribute_ids.filter(id => id && id.toString().trim() !== '');
    }

    // Handle new image uploads
    const newImageUrls = [];
    if (req.uploadedFiles && req.uploadedFiles.length > 0) {
      req.uploadedFiles.forEach((file) => {
        newImageUrls.push(file.url);
      });
    }

    // Determine which old images to delete
    // If imagesToKeep is not in request at all -> keep all existing images
    // If imagesToKeep is in request (even as empty array) -> only keep specified images
    const imagesToKeep = 'imagesToKeep' in req.body
      ? (Array.isArray(req.body.imagesToKeep) ? req.body.imagesToKeep : [])
      : existingProduct.images;
    
    // Find images that aren't in the keep list
    const imagesToDelete = existingProduct.images.filter(
      (img) => !imagesToKeep.includes(img)
    );

    // Delete unmentioned images from Cloudinary
    if (imagesToDelete.length > 0) {
      try {
        await deleteMultipleFromCloudinary(imagesToDelete);
      } catch (deleteError) {
      }
    }

    // Merge new images with images to keep
    const allImages = imagesToKeep.concat(newImageUrls);

    const updateData = {
      ...req.body,
      images: allImages.length > 0 ? allImages : existingProduct.images,
    };

    // Remove imagesToKeep from updateData as it's not a model field
    delete updateData.imagesToKeep;

    const product = await Products.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('category_id')
      .populate('attribute_ids');

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    // Clean up uploaded files on error
    if (req.files && req.files.length > 0) {
      try {
        await deleteMultipleFromCloudinary(req.files.map(f => f.path));
      } catch (deleteError) {
      }
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check access: Admin can delete any, Seller can only delete own
    if (req.user.role === 'seller' && req.user.seller_id) {
      const sellerId = req.user.seller_id._id || req.user.seller_id;
      const productSellerId = product.seller_id?._id || product.seller_id;
      if (sellerId.toString() !== productSellerId.toString()) {
        return res.status(403).json({ message: 'Access denied. You can only delete your own products.' });
      }
    }
    // Admin can delete any product

    // Delete all images from Cloudinary
    if (product.images && product.images.length > 0) {
      try {
        await deleteMultipleFromCloudinary(product.images);
      } catch (deleteError) {
        // Continue with deletion even if Cloudinary deletion fails
      }
    }

    await product.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Increment product redirects
// @route   PUT /api/products/:id/redirect
// @access  Public
const incrementRedirect = async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.redirects += 1;
    await product.save();

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  incrementRedirect,
};

