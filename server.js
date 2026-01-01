
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employee');
const dutyRoutes = require('./routes/duty');

dotenv.config();

const app = express();
app.use(cors());
// Increase limit for Base64 images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 1. Database Connection Logic
const connectWithRetry = () => {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error('CRITICAL ERROR: MONGO_URI is missing in Environment Variables.');
    return;
  }

  console.log('Attempting MongoDB connection...');
  mongoose.connect(MONGO_URI)
    .then(() => console.log('Successfully connected to MongoDB Atlas.'))
    .catch(err => {
      console.error('MongoDB connection error. Retrying in 5 seconds...', err.message);
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

// 2. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/duties', dutyRoutes);

// 3. Health check for Render
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'active', timestamp: new Date().toISOString() });
});

// 4. Serve Static Files
app.use(express.static(__dirname));

// 5. Catch-all Route for React Router
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`DutySync Pro running on port ${PORT}`);
});
