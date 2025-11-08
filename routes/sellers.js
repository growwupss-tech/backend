const express = require('express');
const router = express.Router();
const {
  getSellers,
  getSeller,
  createSeller,
  updateSeller,
  deleteSeller,
} = require('../controllers/sellerController');
const { protect, isAdmin, isSeller } = require('../middleware/auth');

// Get all sellers (admin can see all, seller can see own)
router.get('/', protect, getSellers);

// Create seller profile (visitors can create, which upgrades them to seller)
router.post('/', protect, createSeller);

// Get/update/delete specific seller by ID (admin can access any, seller can only access own)
router.get('/:id', protect, isSeller, getSeller);
router.put('/:id', protect, isSeller, updateSeller);
router.delete('/:id', protect, isSeller, deleteSeller);

module.exports = router;

