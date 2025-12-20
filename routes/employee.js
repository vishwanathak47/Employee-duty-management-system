
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Employee = require('../models/Employee');

router.get('/', auth, async (req, res) => {
  try {
    const employees = await Employee.find().sort({ name: 1 });
    res.json(employees);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const newEmployee = new Employee(req.body);
    const employee = await newEmployee.save();
    res.json(employee);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(employee);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
