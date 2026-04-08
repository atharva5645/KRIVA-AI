const db = require('../config/db');

// @desc    Make an offer on a product
// @route   POST /api/offers/makeOffer
exports.makeOffer = async (req, res, next) => {
    try {
        const { product_id, offered_price } = req.body;
        const buyer_id = req.user.id; // Extract 'id' from protected token payload
        const [result] = await db.query(
            'INSERT INTO offers (product_id, buyer_id, offered_price, status) VALUES (?, ?, ?, "pending")',
            [product_id, buyer_id, offered_price]
        );

        // Notify the Farmer
        const [product] = await db.query('SELECT name, farmer_id FROM products WHERE product_id = ?', [product_id]);
        if (product[0]) {
            const { createNotification } = require('./notificationController');
            await createNotification(
                product[0].farmer_id, 
                `New offer of ₹${offered_price}/kg for your ${product[0].name}!`, 
                'OFFER'
            );
        }

        res.status(201).json({ success: true, offer_id: result.insertId });

    } catch (error) {
        next(error);
    }
};

// @desc    Accept an offer and create an order
// @route   POST /api/offers/acceptOffer
exports.acceptOffer = async (req, res, next) => {
    try {
        const { offer_id } = req.body;

        // 1. Get offer details
        const [offer] = await db.query('SELECT * FROM offers WHERE offer_id = ?', [offer_id]);
        if (!offer[0]) return res.status(404).json({ success: false, error: 'Offer not found' });

        // 2. Update offer status
        await db.query('UPDATE offers SET status = "accepted" WHERE offer_id = ?', [offer_id]);

        // 3. Create Order
        const { product_id, buyer_id, offered_price } = offer[0];
        const [product] = await db.query('SELECT quantity FROM products WHERE product_id = ?', [product_id]);
        
        await db.query(
            'INSERT INTO orders (product_id, buyer_id, final_price, quantity, status) VALUES (?, ?, ?, ?, "pending")',
            [product_id, buyer_id, offered_price, product[0].quantity, 'pending']
        );

        // Notify the Buyer
        const [prodInfo] = await db.query('SELECT name FROM products WHERE product_id = ?', [product_id]);
        const { createNotification } = require('./notificationController');
        await createNotification(
            buyer_id, 
            `Your offer for ${prodInfo[0].name} has been accepted! See your Orders page for details.`, 
            'ORDER'
        );

        res.json({ success: true, message: 'Offer accepted and order created' });

    } catch (error) {
        next(error);
    }
};


// @desc    Get offers for a product
// @route   GET /api/offers/:productId
exports.getOffersByProduct = async (req, res, next) => {
    try {
        const [offers] = await db.query(
            'SELECT o.*, u.name as buyer_name FROM offers o JOIN users u ON o.buyer_id = u.user_id WHERE product_id = ?',
            [req.params.productId]
        );
        res.json({ success: true, data: offers });
    } catch (error) {
        next(error);
    }
};
// @desc    Get offers for all products owned by the farmer
// @route   GET /api/offers/farmer
exports.getOffersForFarmer = async (req, res, next) => {
    try {
        const farmer_id = req.user.id;
        const [offers] = await db.query(`
            SELECT o.*, p.name as product_name, p.base_price, u.name as buyer_name 
            FROM offers o 
            JOIN products p ON o.product_id = p.product_id 
            JOIN users u ON o.buyer_id = u.user_id 
            WHERE p.farmer_id = ?
            ORDER BY o.created_at DESC
        `, [farmer_id]);
        
        res.json({ success: true, count: offers.length, data: offers });
    } catch (error) {
        next(error);
    }
};
