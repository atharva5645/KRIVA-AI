const db = require('../config/db');

(async () => {
    try {
        const [rows] = await db.query('SELECT user_id, name, email, phone, role FROM users ORDER BY role');
        rows.forEach(u => console.log(u.role + ' | ' + u.email + ' | ' + u.name));
        process.exit(0);
    } catch (e) { console.error(e.message); process.exit(1); }
})();
