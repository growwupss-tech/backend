const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password').populate('seller_id');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Check if user is a seller
const isSeller = async (req, res, next) => {
  if (!req.user || !req.user.seller_id) {
    return res.status(403).json({ message: 'Access denied. Seller privileges required.' });
  }
  req.seller = req.user.seller_id;
  next();
};

// Check if user owns the business
const ownsBusiness = async (req, res, next) => {
  try {
    const Business = require('../models/Business');
    const businessId = req.params.businessId || req.body.business_id || req.query.business_id;

    if (!businessId) {
      return res.status(400).json({ message: 'Business ID is required' });
    }

    if (!req.user || !req.user.seller_id) {
      return res.status(403).json({ message: 'Access denied. Seller privileges required.' });
    }

    const business = await Business.findById(businessId);
    
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check if business belongs to the seller
    if (business.seller_id.toString() !== req.user.seller_id._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You do not own this business.' });
    }

    req.business = business;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { protect, isSeller, ownsBusiness };

