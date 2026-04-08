const db = require('../config/db');

// @desc    Get all products
// @route   GET /api/products
exports.getProducts = async (req, res, next) => {
    try {
        const [products] = await db.query(`
            SELECT p.*, u.name as farmer 
            FROM products p 
            JOIN users u ON p.farmer_id = u.user_id 
            ORDER BY p.created_at DESC
        `);
        res.json({ success: true, count: products.length, data: products });
    } catch (error) {
        next(error);
    }
};


// @desc    Add new product
// @route   POST /api/products
exports.addProduct = async (req, res, next) => {
    try {
        const { name, base_price, quantity, region } = req.body;
        const farmer_id = req.user.id; // Extract from protected token
        const [result] = await db.query(
            'INSERT INTO products (name, base_price, quantity, region, farmer_id) VALUES (?, ?, ?, ?, ?)',
            [name, base_price, quantity, region, farmer_id]
        );

        res.status(201).json({ success: true, id: result.insertId });
    } catch (error) {
        next(error);
    }
};
