const db = require('../config/db');

// @desc    Get cooperative overview
// @route   GET /api/cooperatives/overview
exports.getOverview = async (req, res, next) => {
    try {
        const [totalFarmers] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "farmer"');
        const [activeOffers] = await db.query('SELECT COUNT(*) as count FROM products');

        res.json({
            success: true,
            data: {
                totalFarmers: totalFarmers[0].count,
                activeOffers: activeOffers[0].count,
                marketHealth: 'Excellent'
            }
        });
    } catch (error) {
        next(error);
    }
};
