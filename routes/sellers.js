const express = require('express');
const router = express.Router();
const {
  getSellers,
  getSeller,
  createSeller,
  updateSeller,
  deleteSeller,
} = require('../controllers/sellerController');
const { protect } = require('../middleware/auth');

// Get all sellers (admin only - can be enhanced later)
router.get('/', protect, getSellers);

// Create seller profile for authenticated user
router.post('/', protect, createSeller);

// Get/update/delete own seller profile (must be before /:id route)
router.get('/me', protect, getSeller);
router.put('/me', protect, updateSeller);
router.delete('/me', protect, deleteSeller);

// Get/update/delete specific seller by ID
router.get('/:id', protect, getSeller);
router.put('/:id', protect, updateSeller);
router.delete('/:id', protect, deleteSeller);

module.exports = router;

