
const mongoose = require('mongoose');

const monthlyDutySchema = new mongoose.Schema({
  monthYear: { type: String, required: true }, // e.g. "November 2025"
  count: { type: Number, default: 0 }
});

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female'], required: true },
  address: { type: String },
  photoUrl: { type: String },
  totalDutiesCount: { type: Number, default: 0 },
  monthlyDuties: [monthlyDutySchema],
  createdAt: { type: Date, default: () => new Date(new Date().getTime() + (3600000 * 5.5)) }
});

module.exports = mongoose.model('Employee', employeeSchema);
