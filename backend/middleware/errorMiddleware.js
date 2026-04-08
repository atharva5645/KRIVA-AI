const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    const statusCode = err.statusCode || 500;

    let message = err.message || 'Internal Server Error';
    if (err.code === 'ECONNREFUSED') {
        message = 'Database server is not running. Please start MySQL.';
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
        message = 'Database credentials are invalid. Check DB_USER/DB_PASSWORD in backend/.env.';
    } else if (err.code === 'ER_BAD_DB_ERROR') {
        message = 'Database not found. Create DB_NAME and import schema.sql.';
    } else if (err.code === 'ER_NO_SUCH_TABLE') {
        message = 'Required tables are missing. Import backend/schema.sql.';
    }

    res.status(statusCode).json({
        success: false,
        error: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorHandler;
