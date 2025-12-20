
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

// IST Utility for Global Use
const getISTDate = () => {
  const date = new Date();
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * 5.5));
};

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dutysync')
  .then(() => console.log('MongoDB Connected (IST Mode Active)'))
  .catch(err => console.error('Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/duties', dutyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
