const Products = require('../models/Products');
const { deleteMultipleFromCloudinary, extractPublicId } = require('../config/cloudinary');

// @desc    Get all products
// @route   GET /api/products
// @access  Private/Public
const getProducts = async (req, res) => {
  try {
    const { is_visible, category_id } = req.query;
    let query = {};

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
        console.error('Error cleaning up uploaded files:', deleteError);
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
          console.error('Error cleaning up uploaded files:', deleteError);
        }
      }
      return res.status(404).json({ message: 'Product not found' });
    }

    // Handle new image uploads
    const newImageUrls = [];
    if (req.uploadedFiles && req.uploadedFiles.length > 0) {
      req.uploadedFiles.forEach((file) => {
        newImageUrls.push(file.url);
      });
    }

    // Determine which old images to delete
    // If imagesToKeep is not provided at all, keep all existing images
    // If it's provided (even as empty array), only keep the specified images
    const imagesToKeep = req.body.hasOwnProperty('imagesToKeep') 
      ? (req.body.imagesToKeep || [])
      : existingProduct.images;
    
    // Find images that aren't in the keep list
    const imagesToDelete = existingProduct.images.filter(
      (img) => !imagesToKeep.includes(img)
    );

    // Delete unmentioned images from Cloudinary
    if (imagesToDelete.length > 0) {
      try {
        console.log('Deleting images from Cloudinary:', imagesToDelete);
        await deleteMultipleFromCloudinary(imagesToDelete);
      } catch (deleteError) {
        console.error('Error deleting images from Cloudinary:', deleteError);
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
        console.error('Error cleaning up uploaded files:', deleteError);
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

    // Delete all images from Cloudinary
    if (product.images && product.images.length > 0) {
      try {
        await deleteMultipleFromCloudinary(product.images);
      } catch (deleteError) {
        console.error('Error deleting images from Cloudinary:', deleteError);
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

