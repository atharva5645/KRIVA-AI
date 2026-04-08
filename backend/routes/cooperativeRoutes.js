const express = require('express');
const router = express.Router();
const { getOverview } = require('../controllers/cooperativeController');
const { protect } = require('../middleware/authMiddleware');

router.get('/overview', protect, getOverview);

module.exports = router;
