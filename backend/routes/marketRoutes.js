const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get price prediction for a commodity
// @route   GET /api/market/predict
router.get('/predict', async (req, res, next) => {
    try {
        const { commodity, district } = req.query;
        const response = await axios.get(`${process.env.AI_SERVICE_URL}/predict-market`, {
            params: { commodity, district }
        });
        res.json(response.data);
    } catch (error) {
        // Fallback or better error handling
        res.status(error.response?.status || 500).json({
            success: false,
            error: 'AI Service communication failed',
            details: error.message
        });
    }
});

// @desc    Get demand prediction for a product
// @route   GET /api/market/demand
router.get('/demand', protect, async (req, res, next) => {
    try {
        const { product } = req.query;
        const response = await axios.get(`${process.env.AI_SERVICE_URL}/predict`, {
            params: { product }
        });
        res.json(response.data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
