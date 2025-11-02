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

router.put('/:id/views', incrementViews);
router.put('/:id/clicks', incrementClicks);

module.exports = router;

