const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const fileUpload = require('express-fileupload');

const authRoute = require('./routes/authRoute');
const adminRoutes = require('./routes/adminRoutes');
const businessAuthRoutes = require('./routes/businessAuthRoutes');
const turfRoute = require('./routes/turfRoute');
const businessRoutes = require('./routes/businessRoutes');
const userAuthRoutes = require('./routes/userAuthRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Connect to MongoDB
connectDB();

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running' });
});

app.use('/api/auth', authRoute);
app.use('/api/admin/auth', authRoute);
app.use('/api/business/auth', businessAuthRoutes);
app.use('/api/turfs', turfRoute);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userAuthRoutes);
app.use('/api/user/auth', userAuthRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/user/bookings', bookingRoutes);
app.use('/api/bookings', bookingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
