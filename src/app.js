const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const fileUpload = require('express-fileupload');
const routes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

connectDB();

app.use('/api', routes);

module.exports = app;
