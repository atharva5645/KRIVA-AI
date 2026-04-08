const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorMiddleware');
const { init: initSocket } = require('./socket');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/market', require('./routes/marketRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/offers', require('./routes/offerRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/cooperatives', require('./routes/cooperativeRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

app.get('/api/health', (req, res) => {
    res.json({ status: 'up', message: 'KRIVA API is healthy' });
});

// Error Handling
app.use(errorHandler);

// Initialize Socket.io (Note: socket.io may have limited support in serverless environments)
initSocket(server);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
}

module.exports = app;
