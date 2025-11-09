const Attributes = require('../models/Attributes');
const Products = require('../models/Products');

// @desc    Get all attributes
// @route   GET /api/attributes
// @access  Public
const getAttributes = async (req, res) => {
  try {
    let attributes;

    // Admin can see all attributes, Seller can only see attributes from their products
    if (req.user.role === 'seller' && req.user.seller_id) {
      const sellerId = req.user.seller_id?._id || req.user.seller_id;
      
      // Find all products belonging to this seller
      const sellerProducts = await Products.find({ seller_id: sellerId }).select('attribute_ids');
      
      // Collect all unique attribute IDs from seller's products
      const attributeIds = [];
      sellerProducts.forEach(product => {
        if (product.attribute_ids && product.attribute_ids.length > 0) {
          product.attribute_ids.forEach(attrId => {
            const attrIdStr = attrId.toString();
            if (!attributeIds.includes(attrIdStr)) {
              attributeIds.push(attrIdStr);
            }
          });
        }
      });

      // If seller has no products with attributes, return empty array
      if (attributeIds.length === 0) {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }

      // Find attributes that are referenced by seller's products
      attributes = await Attributes.find({ _id: { $in: attributeIds } });
    } else {
      // Admin or public: return all attributes
      attributes = await Attributes.find();
    }

    res.status(200).json({ success: true, count: attributes.length, data: attributes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single attribute
// @route   GET /api/attributes/:id
// @access  Public
const getAttribute = async (req, res) => {
  try {
    const attribute = await Attributes.findById(req.params.id);

    if (!attribute) {
      return res.status(404).json({ message: 'Attribute not found' });
    }

    // Check access: Admin can access any, Seller can only access attributes from their products
    if (req.user.role === 'seller' && req.user.seller_id) {
      const sellerId = req.user.seller_id?._id || req.user.seller_id;
      
      // Check if this attribute is used in any of the seller's products
      const sellerProducts = await Products.find({ 
        seller_id: sellerId,
        attribute_ids: req.params.id
      });

      if (sellerProducts.length === 0) {
        return res.status(403).json({ 
          message: 'Access denied. You can only access attributes from your own products.' 
        });
      }
    }

    res.status(200).json({ success: true, data: attribute });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create attribute
// @route   POST /api/attributes
// @access  Private
const createAttribute = async (req, res) => {
  try {
    // Attributes can be created by anyone (admin or seller)
    // They will be linked to products when products are created/updated
    const attribute = await Attributes.create(req.body);
    res.status(201).json({ success: true, data: attribute });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update attribute
// @route   PUT /api/attributes/:id
// @access  Private
const updateAttribute = async (req, res) => {
  try {
    const existingAttribute = await Attributes.findById(req.params.id);

    if (!existingAttribute) {
      return res.status(404).json({ message: 'Attribute not found' });
    }

    // Check access: Admin can update any, Seller can only update attributes from their products
    if (req.user.role === 'seller' && req.user.seller_id) {
      const sellerId = req.user.seller_id._id || req.user.seller_id;
      
      // Check if this attribute is used in any of the seller's products
      const sellerProducts = await Products.find({ 
        seller_id: sellerId,
        attribute_ids: req.params.id
      });

      if (sellerProducts.length === 0) {
        return res.status(403).json({ 
          message: 'Access denied. You can only update attributes from your own products.' 
        });
      }
    }
    // Admin can update any attribute

    const attribute = await Attributes.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: attribute });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete attribute
// @route   DELETE /api/attributes/:id
// @access  Private
const deleteAttribute = async (req, res) => {
  try {
    const attribute = await Attributes.findById(req.params.id);

    if (!attribute) {
      return res.status(404).json({ message: 'Attribute not found' });
    }

    // Check access: Admin can delete any, Seller can only delete attributes from their products
    if (req.user.role === 'seller' && req.user.seller_id) {
      const sellerId = req.user.seller_id._id || req.user.seller_id;
      
      // Check if this attribute is used in any of the seller's products
      const sellerProducts = await Products.find({ 
        seller_id: sellerId,
        attribute_ids: req.params.id
      });

      if (sellerProducts.length === 0) {
        return res.status(403).json({ 
          message: 'Access denied. You can only delete attributes from your own products.' 
        });
      }
    }
    // Admin can delete any attribute

    await attribute.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAttributes,
  getAttribute,
  createAttribute,
  updateAttribute,
  deleteAttribute,
};

