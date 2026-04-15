const express = require('express');
const Appointment = require('../models/appointment');
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Get available slots for a doctor on a specific date
router.get('/slots', authMiddleware.protect, appointmentController.getSlotsByDate);

// Create new appointment
router.post('/', async (req, res) => {
  try {
    // Use appointment controller for proper slot management
    const appointmentController = require('../controllers/appointmentController');
    return appointmentController.bookAppointment(req, res);
  } catch (err) {
    return res.status(500).json({ message: 'Unable to create appointment', error: err.message });
  }
});

// Get all appointments
router.get('/', authMiddleware.protect, async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    return res.json(appointments);
  } catch (err) {
    return res.status(500).json({ message: 'Unable to fetch appointments', error: err.message });
  }
});

// Get appointment by MongoDB _id
router.get('/:id', authMiddleware.protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    return res.json(appointment);
  } catch (err) {
    return res.status(500).json({ message: 'Unable to fetch appointment', error: err.message });
  }
});

// Get appointments for a specific patient by email
router.get('/patient/:email', authMiddleware.protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ email: req.params.email }).sort({ appointmentDate: -1 });
    return res.json(appointments);
  } catch (err) {
    return res.status(500).json({ message: 'Unable to fetch appointments', error: err.message });
  }
});

// Update appointment
router.put('/:id', appointmentController.updateAppointment);

// Update appointment status
router.put('/:id/status', appointmentController.updateAppointmentStatus);

// Delete appointment
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;
