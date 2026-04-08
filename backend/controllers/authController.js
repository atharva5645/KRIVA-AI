const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

let phoneColumnChecked = false;
const TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || '365d';

const normalizePhone = (value = '') => {
    const digits = String(value).replace(/\D/g, '');
    if (!digits) return '';

    // Keep last 10 digits so +91XXXXXXXXXX and XXXXXXXXXX map to same phone.
    return digits.length > 10 ? digits.slice(-10) : digits;
};
const normalizeEmail = (value = '') => String(value || '').trim().toLowerCase();
const isValidEmail = (value = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
const normalizeRole = (role = '') => {
    const value = String(role || '').trim().toLowerCase();
    if (value === 'corporate' || value === 'corporate_admin' || value === 'cooperative') {
        return 'cooperative_admin';
    }
    if (value === 'farmer' || value === 'consumer' || value === 'cooperative_admin') {
        return value;
    }
    return 'farmer';
};

const ensurePhoneColumn = async () => {
    if (phoneColumnChecked) return;
    const [columns] = await db.query(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'phone'",
        [process.env.DB_NAME]
    );

    if (!columns.length) {
        await db.query('ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL');
        await db.query('CREATE UNIQUE INDEX idx_users_phone ON users (phone)');
    }
    phoneColumnChecked = true;
};

// @desc    Register new user
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
    try {
        await ensurePhoneColumn();

        const { name, email, phone, mobile, password, role } = req.body;
        const assignedRole = normalizeRole(role || 'farmer');
        const normalizedPhone = normalizePhone(phone || mobile);
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const fallbackEmail = `${normalizedPhone}@mobile.local`;
        const finalEmail = normalizedEmail || fallbackEmail;

        if (!password || !name) {
            return res.status(400).json({ success: false, error: 'Name, mobile number and password are required' });
        }

        if (!normalizedPhone || normalizedPhone.length < 10 || normalizedPhone.length > 15) {
            return res.status(400).json({ success: false, error: 'Please enter a valid mobile number' });
        }

        const [existing] = await db.query('SELECT user_id FROM users WHERE email = ? OR phone = ?', [finalEmail, normalizedPhone]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, error: 'User already exists with this email or mobile number' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await db.query(
            'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
            [name, finalEmail, normalizedPhone, hashedPassword, assignedRole]
        );

        const token = jwt.sign(
            { id: result.insertId, role: assignedRole },
            process.env.JWT_SECRET,
            { expiresIn: TOKEN_EXPIRY }
        );

        res.status(201).json({
            success: true,
            token,
            user: { id: result.insertId, name, email: finalEmail, phone: normalizedPhone, role: assignedRole }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
    try {
        await ensurePhoneColumn();

        const { mobile, email, password, role } = req.body;
        const normalizedMobile = normalizePhone(mobile);
        const normalizedEmail = normalizeEmail(email);

        if (!password) {
            return res.status(400).json({ success: false, error: 'Password is required' });
        }

        if (!normalizedMobile && !normalizedEmail) {
            return res.status(400).json({ success: false, error: 'Mobile number or email is required' });
        }

        if (normalizedEmail && !isValidEmail(normalizedEmail)) {
            return res.status(400).json({ success: false, error: 'Please enter a valid email address' });
        }

        const query = normalizedMobile
            ? 'SELECT * FROM users WHERE phone = ?'
            : 'SELECT * FROM users WHERE LOWER(email) = ?';
        const queryParam = normalizedMobile || normalizedEmail;
        const [users] = await db.query(query, [queryParam]);
        const user = users[0];

        if (!user) {
            return res.status(401).json({
                success: false,
                error: normalizedMobile
                    ? 'Mobile number not registered. Please sign up first.'
                    : 'Email not registered. Please sign up first.'
            });
        }

        if (!(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Do not block login by selected role tab; use real DB role as source of truth.
        const resolvedRole = normalizeRole(user.role || role);

        const token = jwt.sign(
            { id: user.user_id, role: resolvedRole },
            process.env.JWT_SECRET,
            { expiresIn: TOKEN_EXPIRY }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.user_id,
                name: user.name,
                email: user.email || '',
                phone: user.phone || '',
                role: resolvedRole
            }
        });
    } catch (error) {
        next(error);
    }
};
