const express = require('express');
const router = express.Router();
const { makeOffer, acceptOffer, getOffersByProduct, getOffersForFarmer } = require('../controllers/offerController');
const { protect } = require('../middleware/authMiddleware');

router.post('/makeOffer', protect, makeOffer);
router.post('/acceptOffer', protect, acceptOffer);
router.get('/farmer', protect, getOffersForFarmer);
router.get('/:productId', protect, getOffersByProduct);


module.exports = router;
