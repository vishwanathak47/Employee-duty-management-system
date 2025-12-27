
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employee');
const dutyRoutes = require('./routes/duty');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connection retry logic for more stable production starts
const connectWithRetry = () => {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error('CRITICAL: MONGO_URI is missing in Environment Variables.');
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

// Health check for Render monitoring
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'active', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/duties', dutyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`DutySync Backend is live on port ${PORT}`);
  console.log(`Production Mode: ${process.env.NODE_ENV === 'production'}`);
});
