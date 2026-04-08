const express = require('express');
const router = express.Router();
const { confirmOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/confirmOrder', protect, confirmOrder);
router.get('/my-orders', protect, require('../controllers/orderController').getUserOrders);
router.get('/sales-history', protect, require('../controllers/orderController').getFarmerSales);


module.exports = router;
