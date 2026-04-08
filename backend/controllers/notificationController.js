const db = require('../config/db');

let notificationsTableReady = false;

const ensureNotificationsTable = async () => {
    if (notificationsTableReady) return;

    await db.query(`
        CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            farmer_id INT NOT NULL,
            message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (farmer_id) REFERENCES users(user_id) ON DELETE CASCADE
        )
    `);

    notificationsTableReady = true;
};

// @desc    Get all notifications for the authenticated user
// @route   GET /api/notifications
exports.getNotifications = async (req, res, next) => {
    try {
        await ensureNotificationsTable();
        const farmer_id = req.user.id;
        const [notifications] = await db.query(
            `SELECT id AS notification_id, farmer_id, message, is_read, created_at
             FROM notifications
             WHERE farmer_id = ?
             ORDER BY created_at DESC
             LIMIT 50`,
            [farmer_id]
        );
        res.json({ success: true, count: notifications.length, data: notifications });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id
exports.markAsRead = async (req, res, next) => {
    try {
        await ensureNotificationsTable();
        const { id } = req.params;
        const farmer_id = req.user.id;
        await db.query(
            'UPDATE notifications SET is_read = TRUE WHERE id = ? AND farmer_id = ?',
            [id, farmer_id]
        );
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        next(error);
    }
};

// Helper function to create notification (internal use)
exports.createNotification = async (farmer_id, message) => {
    try {
        await ensureNotificationsTable();
        const [result] = await db.query(
            'INSERT INTO notifications (farmer_id, message, is_read) VALUES (?, ?, FALSE)',
            [farmer_id, message]
        );
        return result.insertId;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
};
