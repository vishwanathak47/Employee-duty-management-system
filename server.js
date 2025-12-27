
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

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined in environment variables.');
  console.error('Please add it in your Render settings.');
} else {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected successfully to cloud Atlas'))
    .catch(err => {
      console.error('MongoDB Connection Failed:');
      console.error(err.message);
    });
}

app.get('/health', (req, res) => res.send('System Online'));

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/duties', dutyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
