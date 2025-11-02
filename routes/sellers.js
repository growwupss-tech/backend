const express = require('express');
const router = express.Router();
const {
  getSellers,
  getSeller,
  createSeller,
  updateSeller,
  deleteSeller,
} = require('../controllers/sellerController');
const { protect, isSeller } = require('../middleware/auth');

router.route('/').get(protect, getSellers).post(protect, isSeller, createSeller);
router.route('/:id').get(protect, getSeller).put(protect, isSeller, updateSeller).delete(protect, isSeller, deleteSeller);

module.exports = router;

