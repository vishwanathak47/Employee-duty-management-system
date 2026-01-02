
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Employee = require('../models/Employee');

router.get('/', auth, async (req, res) => {
  try {
    const employees = await Employee.find({ supervisor: req.user.id }).sort({ name: 1 });
    res.json(employees);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const newEmployee = new Employee({
      ...req.body,
      supervisor: req.user.id
    });
    const employee = await newEmployee.save();
    res.json(employee);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, supervisor: req.user.id },
      req.body,
      { new: true }
    );
    if (!employee) return res.status(404).json({ message: 'Employee not found or unauthorized' });
    res.json(employee);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await Employee.findOneAndDelete({ _id: req.params.id, supervisor: req.user.id });
    if (!result) return res.status(404).json({ message: 'Employee not found or unauthorized' });
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
