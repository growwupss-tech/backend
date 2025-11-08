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

// Optional protect - sets req.user if token is provided, but doesn't fail if not
const optionalProtect = async (req, res, next) => {
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

      // Continue even if user not found (optional auth)
      next();
    } catch (error) {
      // Continue without user if token is invalid (optional auth)
      req.user = null;
      next();
    }
  } else {
    // No token provided, continue without user
    req.user = null;
    next();
  }
};

// Check if user is an admin
const isAdmin = async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Check if user is a seller (role-based)
const isSeller = async (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ message: 'Access denied. Authentication required.' });
  }
  
  // Admin can access seller routes
  if (req.user.role === 'admin') {
    return next();
  }
  
  // Check if user is seller and has seller_id
  // Handle both populated object and ObjectId
  const sellerId = req.user.seller_id?._id || req.user.seller_id;
  if (req.user.role !== 'seller' || !sellerId) {
    return res.status(403).json({ 
      message: 'Access denied. Seller privileges required. Please upgrade your account.' 
    });
  }
  
  req.seller = sellerId;
  next();
};

// Check if user is a visitor
const isVisitor = async (req, res, next) => {
  if (!req.user || req.user.role !== 'visitor') {
    return res.status(403).json({ message: 'Access denied. Visitor access only.' });
  }
  next();
};

// Check if user owns the resource (for sellers, only their own data)
const ownsResource = async (req, res, next) => {
  // Admin can access all resources
  if (req.user.role === 'admin') {
    return next();
  }
  
  // Sellers can only access their own resources
  if (req.user.role === 'seller' && req.user.seller_id) {
    return next();
  }
  
  return res.status(403).json({ message: 'Access denied. You can only access your own resources.' });
};

// Check if user owns the business
const ownsBusiness = async (req, res, next) => {
  try {
    const Business = require('../models/Business');
    const businessId = req.params.businessId || req.params.id || req.body.business_id || req.query.business_id;

    if (!businessId) {
      return res.status(400).json({ message: 'Business ID is required' });
    }

    // Admin can access all businesses
    if (req.user.role === 'admin') {
      const business = await Business.findById(businessId);
      if (!business) {
        return res.status(404).json({ message: 'Business not found' });
      }
      req.business = business;
      return next();
    }

    if (!req.user || !req.user.seller_id) {
      return res.status(403).json({ message: 'Access denied. Seller privileges required.' });
    }

    const business = await Business.findById(businessId);
    
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check if business belongs to the seller
    const sellerId = req.user.seller_id._id || req.user.seller_id;
    if (business.seller_id.toString() !== sellerId.toString()) {
      return res.status(403).json({ message: 'Access denied. You do not own this business.' });
    }

    req.business = business;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { protect, optionalProtect, isAdmin, isSeller, isVisitor, ownsResource, ownsBusiness };

