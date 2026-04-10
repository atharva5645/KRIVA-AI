const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

let poolConfig;

// Support both unified DATABASE_URL and individual variables
if (process.env.DATABASE_URL) {
    poolConfig = {
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 2, // Optimized for serverless
        queueLimit: 0,
    };
    
    // Automatically enable SSL for Aiven hosts
    if (process.env.DATABASE_URL.includes('aivencloud.com')) {
        poolConfig.ssl = { rejectUnauthorized: false };
    }
} else {
    poolConfig = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT) || 3306,
        waitForConnections: true,
        connectionLimit: 2,
        queueLimit: 0,
        // Auto-enable SSL for Aiven even in individual mode
        ssl: (process.env.DB_SSL === 'true' || (process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud.com'))) 
            ? { rejectUnauthorized: false } 
            : undefined
    };
}

const pool = mysql.createPool(poolConfig);

// Test connection
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL Database Connected successfully.');
        connection.release();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    }
})();

module.exports = pool;
