
const mongoose = require('mongoose');

const dutySchema = new mongoose.Schema({
  supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD (IST)
  shiftTime: { 
    type: String, 
    enum: ["6am to 2pm", "2pm to 10pm", "9am to 6pm"], 
    required: true 
  },
  isScheduled: { type: Boolean, default: true },
  isCompleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('Duty', dutySchema);
