const express = require('express');
const router = express.Router();
const {
  getBusinesses,
  getBusinessesBySeller,
  getBusiness,
  createBusiness,
  updateBusiness,
  deleteBusiness,
} = require('../controllers/businessController');
const { protect, isSeller, ownsBusiness } = require('../middleware/auth');

router.route('/').get(protect, getBusinesses).post(protect, isSeller, createBusiness);
router.route('/seller/:sellerId').get(protect, isSeller, getBusinessesBySeller);
router
  .route('/:id')
  .get(protect, getBusiness)
  .put(protect, isSeller, ownsBusiness, updateBusiness)
  .delete(protect, isSeller, ownsBusiness, deleteBusiness);

module.exports = router;

