const express = require('express');
const router = express.Router();
const {
  getSiteDetails,
  getSiteDetail,
  createSiteDetail,
  updateSiteDetail,
  deleteSiteDetail,
  addHeroSlide,
  removeHeroSlide,
} = require('../controllers/siteDetailsController');
const { protect, isSeller } = require('../middleware/auth');

router.route('/').get(protect, getSiteDetails).post(protect, isSeller, createSiteDetail);
router
  .route('/:id')
  .get(protect, getSiteDetail)
  .put(protect, isSeller, updateSiteDetail)
  .delete(protect, isSeller, deleteSiteDetail);

router.put('/:id/hero-slides', protect, isSeller, addHeroSlide);
router.delete('/:id/hero-slides/:heroSlideId', protect, isSeller, removeHeroSlide);

module.exports = router;

