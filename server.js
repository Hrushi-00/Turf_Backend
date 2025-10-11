const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const fileUpload = require('express-fileupload');

const authRoute = require('./routes/authRoute');
const turfRoute = require('./routes/turfRoute');
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoute);
app.use('/api/turfs', turfRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
