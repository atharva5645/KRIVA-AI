const db = require('../config/db');
const bcrypt = require('bcryptjs');

const PASSWORD = '222222';

(async () => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(PASSWORD, salt);

        // Reset all existing user passwords
        const [result] = await db.query('UPDATE users SET password = ?', [hashed]);
        console.log('Reset password for ' + result.affectedRows + ' users to: ' + PASSWORD);

        // Check which roles exist
        const [roles] = await db.query('SELECT DISTINCT role FROM users');
        const existingRoles = roles.map(r => r.role);
        console.log('Existing roles:', existingRoles.join(', '));

        // Create missing role accounts
        const needed = ['farmer', 'consumer', 'cooperative_admin'];
        for (const role of needed) {
            if (!existingRoles.includes(role)) {
                const phone = role === 'farmer' ? '9000000001' : role === 'consumer' ? '9000000002' : '9000000003';
                const email = phone + '@mobile.local';
                const name = role === 'farmer' ? 'Test Farmer' : role === 'consumer' ? 'Test Consumer' : 'Test Cooperative';
                await db.query(
                    'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
                    [name, email, phone, hashed, role]
                );
                console.log('Created ' + role + ' account: phone=' + phone + ' password=' + PASSWORD);
            }
        }

        // Show final state
        const [allUsers] = await db.query('SELECT user_id, name, phone, role FROM users ORDER BY role, user_id');
        console.log('\nFinal users:');
        allUsers.forEach(u => console.log('  ' + u.role + ' | ID:' + u.user_id + ' | ' + u.name + ' | phone:' + u.phone));

        process.exit(0);
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
})();
