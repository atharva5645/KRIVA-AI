const db = require('../config/db');
const { getIO } = require('../socket');
const { createNotification } = require('./notificationController');

// @desc    Confirm an order (from an accepted offer)
// @route   POST /api/orders/confirmOrder
exports.confirmOrder = async (req, res, next) => {
    try {
        const { product_id, final_price, quantity } = req.body;
        const buyer_id = req.user?.id || req.body.buyer_id;

        if (!product_id || !buyer_id || !quantity || !final_price) {
            return res.status(400).json({ success: false, error: 'Missing required order fields' });
        }

        const [productRows] = await db.query(
            'SELECT name, farmer_id FROM products WHERE product_id = ?',
            [product_id]
        );

        if (!productRows[0]) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        const product = productRows[0];

        const [consumerRows] = await db.query(
            'SELECT name FROM users WHERE user_id = ?',
            [buyer_id]
        );
        const consumerName = consumerRows[0]?.name || 'Consumer';

        // Create order
        const [result] = await db.query(
            'INSERT INTO orders (product_id, buyer_id, final_price, quantity, status) VALUES (?, ?, ?, ?, "pending")',
            [product_id, buyer_id, final_price, quantity]
        );

        const message = `New Order: ${quantity}kg of ${product.name} from ${consumerName}`;
        const notificationId = await createNotification(product.farmer_id, message);

        const payload = {
            id: notificationId,
            message,
            product: product.name,
            quantity,
            consumerName,
            timestamp: new Date().toISOString(),
            is_read: false
        };

        try {
            const io = getIO();
            io.to(String(product.farmer_id)).emit('new_order_notification', payload);
        } catch (socketError) {
            console.error('Socket emit failed:', socketError.message);
        }

        // Update sales history for AI training
        if (product) {
            const weekNum = Math.ceil(new Date().getDate() / 7); // Simplified week
            await db.query(
                'INSERT INTO sales_history (product_name, week_number, quantity_sold) VALUES (?, ?, ?)',
                [product.name, weekNum, quantity]
            );
        }

        res.status(201).json({ success: true, order_id: result.insertId });
    } catch (error) {
        next(error);
    }
};
// @desc    Get orders for the authenticated buyer
// @route   GET /api/orders/my-orders
exports.getUserOrders = async (req, res, next) => {
    try {
        const buyer_id = req.user.id;
        const [orders] = await db.query(`
            SELECT o.*, p.name as product_name, p.region, u.name as farmer_name 
            FROM orders o 
            JOIN products p ON o.product_id = p.product_id 
            JOIN users u ON p.farmer_id = u.user_id 
            WHERE o.buyer_id = ?
            ORDER BY o.created_at DESC
        `, [buyer_id]);
        res.json({ success: true, count: orders.length, data: orders });
    } catch (error) {
        next(error);
    }
};

// @desc    Get sales history for the authenticated farmer
// @route   GET /api/orders/sales-history
exports.getFarmerSales = async (req, res, next) => {
    try {
        const farmer_id = req.user.id;
        const [sales] = await db.query(`
            SELECT o.*, p.name as product_name, p.region, u.name as buyer_name 
            FROM orders o 
            JOIN products p ON o.product_id = p.product_id 
            JOIN users u ON o.buyer_id = u.user_id 
            WHERE p.farmer_id = ?
            ORDER BY o.created_at DESC
        `, [farmer_id]);
        res.json({ success: true, count: sales.length, data: sales });
    } catch (error) {
        next(error);
    }
};
