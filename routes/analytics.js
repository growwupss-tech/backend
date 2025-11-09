const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getAnalytic,
  createAnalytic,
  updateAnalytic,
  deleteAnalytic,
  getAnalyticsByBusiness,
  incrementViews,
  incrementClicks,
} = require('../controllers/analyticsController');
const { protect, isSeller } = require('../middleware/auth');

router.route('/').get(protect, getAnalytics).post(protect, isSeller, createAnalytic);
router.route('/business/:businessId').get(protect, isSeller, getAnalyticsByBusiness);
router
  .route('/:id')
  .get(protect, getAnalytic)
  .put(protect, isSeller, updateAnalytic)
  .delete(protect, isSeller, deleteAnalytic);

router.put('/:id/views', protect, incrementViews);
router.put('/:id/clicks', protect, incrementClicks);

module.exports = router;

