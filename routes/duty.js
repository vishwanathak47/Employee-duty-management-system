
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Duty = require('../models/Duty');
const Employee = require('../models/Employee');

// Helper to get IST Month String
const getISTMonthYear = () => {
  const date = new Date();
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const ist = new Date(utc + (3600000 * 5.5));
  return ist.toLocaleString('default', { month: 'long', year: 'numeric' });
};

router.post('/schedule', auth, async (req, res) => {
  try {
    const { employeeId, date, shiftTime, isScheduled } = req.body;
    
    // Verify the employee belongs to this supervisor
    const empCheck = await Employee.findOne({ _id: employeeId, supervisor: req.user.id });
    if (!empCheck) return res.status(403).json({ message: 'Unauthorized: Employee does not belong to you' });

    const duty = new Duty({ 
      employee: employeeId, 
      date, 
      shiftTime, 
      isScheduled,
      supervisor: req.user.id 
    });
    await duty.save();
    res.json(duty);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.put('/complete/:id', auth, async (req, res) => {
  try {
    const duty = await Duty.findOne({ _id: req.params.id, supervisor: req.user.id });
    if (!duty || duty.isCompleted) return res.status(400).json({ message: 'Invalid Duty or Unauthorized' });

    duty.isCompleted = true;
    await duty.save();

    const monthYear = getISTMonthYear();
    
    // Atomic update for Employee duty counts - ensured it's the supervisor's employee
    await Employee.updateOne(
      { _id: duty.employee, supervisor: req.user.id, "monthlyDuties.monthYear": monthYear },
      { 
        $inc: { totalDutiesCount: 1, "monthlyDuties.$.count": 1 } 
      }
    ).then(async (result) => {
      // If the month entry didn't exist, push a new one
      if (result.matchedCount === 0) {
        await Employee.updateOne(
          { _id: duty.employee, supervisor: req.user.id },
          { 
            $inc: { totalDutiesCount: 1 },
            $push: { monthlyDuties: { monthYear, count: 1 } }
          }
        );
      }
    });

    res.json(duty);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.get('/status/:date', auth, async (req, res) => {
  try {
    const duties = await Duty.find({ date: req.params.date, supervisor: req.user.id });
    res.json(duties);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// For CSV Report Generation (Raw Data) - now isolated per supervisor
router.get('/report/:monthYear', auth, async (req, res) => {
  try {
    const employees = await Employee.find({ supervisor: req.user.id });
    const data = employees.map(emp => {
      const monthly = emp.monthlyDuties.find(m => m.monthYear === req.params.monthYear);
      return {
        name: emp.name,
        employeeId: emp.employeeId,
        gender: emp.gender,
        monthlyCount: monthly ? monthly.count : 0,
        totalCount: emp.totalDutiesCount
      };
    });
    res.json(data);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
