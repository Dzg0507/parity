
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorMiddleware');

// Load env vars
dotenv.config({ path: './.env' });

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Set security headers
app.use(helmet());

// API routes
app.use('/api/v1', require('./src/api/v1'));

// Direct auth routes for frontend compatibility
app.use('/auth', require('./src/api/v1/authRoutes'));

// Direct uplift routes for frontend compatibility
app.use('/uplift', require('./src/api/v1/upliftRoutes'));

// Direct unpack routes for frontend compatibility
app.use('/unpack', require('./src/api/v1/contentRoutes'));

// Direct users routes for frontend compatibility
app.use('/users', require('./src/api/v1/userRoutes'));

// Direct solo-prep routes for frontend compatibility
app.use('/solo-prep', require('./src/api/v1/sessionRoutes'));

// Direct joint-unpack routes for frontend compatibility
app.use('/joint-unpack', require('./src/api/v1/sessionRoutes'));

// Direct legal routes for frontend compatibility
app.use('/legal', require('./src/api/v1/legalRoutes'));

// Health check endpoint
app.get('/', (req, res) => res.send('Parity API is running...'));

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api/v1`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});