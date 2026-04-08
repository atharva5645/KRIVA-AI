const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function migrate() {
    const uri = process.argv[2];
    if (!uri) {
        console.error('Usage: node migrate.js "mysql://user:password@host:port/dbname?ssl-mode=REQUIRED"');
        process.exit(1);
    }

    console.log('🚀 Starting migration to Cloud DB...');

    try {
        // Strip query params and handle SSL for Aiven
        const cleanUri = uri.split('?')[0];
        const connection = await mysql.createConnection({
            uri: cleanUri,
            ssl: { rejectUnauthorized: false }
        });
        console.log(`✅ Connected to host: ${connection.config.host}`);

        const sqlPath = path.join(__dirname, 'database', 'db.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split by semicolon, filter out CREATE DATABASE and USE statements for Aiven
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('CREATE DATABASE') && !s.startsWith('USE'));

        console.log(`📜 Executing ${statements.length} table/data statements...`);

        for (const statement of statements) {
            try {
                await connection.query(statement);
            } catch (err) {
                if (!err.message.includes('already exists')) {
                    console.warn(`⚠️ Warning: ${err.message}`);
                }
            }
        }

        console.log('✨ Migration complete!');
        await connection.end();
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
