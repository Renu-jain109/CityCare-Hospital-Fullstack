const express = require('express');
const Appointment = require('../models/appointment');
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Get available slots for a doctor on a specific date
router.get('/slots', authMiddleware.protect, async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    
    if (!doctorId || !date) {
      return res.status(400).json({ message: 'doctorId and date are required' });
    }

    // Define all possible time slots
    const allSlots = [
      '09:00 AM', '09:30 AM',
      '10:00 AM', '10:30 AM',
      '11:00 AM', '11:30 AM',
      '12:00 PM',
      '03:00 PM', '03:30 PM',
      '04:00 PM', '04:30 PM',
      '05:00 PM'
    ];

    // Create date range for the entire day to catch all appointments
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Find booked slots for the given doctor and date
    const bookedAppointments = await Appointment.find({
      doctorName: doctorId,
      appointmentDate: {
        $gte: startDate,
        $lte: endDate
      },
      status: { $in: ['pending', 'confirmed'] }
    });

    const bookedSlots = bookedAppointments.map(app => app.timeSlot);

    // Create slot objects with booking status
    const slots = allSlots.map(time => ({
      time,
      isBooked: bookedSlots.includes(time)
    }));

    return res.json(slots);
  } catch (err) {
    console.error('Error fetching slots', err);
    return res.status(500).json({ message: 'Unable to fetch slots', error: err.message });
  }
});

// Create new appointment
router.post('/', async (req, res) => {
  try {
    // Use appointment controller for proper slot management
    const appointmentController = require('../controllers/appointmentController');
    return appointmentController.bookAppointment(req, res);
  } catch (err) {
    console.error('Error creating appointment', err);
    return res.status(500).json({ message: 'Unable to create appointment', error: err.message });
  }
});

// Get all appointments
router.get('/', authMiddleware.protect, async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    return res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments', err);
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
    console.error('Error fetching appointment', err);
    return res.status(500).json({ message: 'Unable to fetch appointment', error: err.message });
  }
});

// Get appointments for a specific patient by email
router.get('/patient/:email', authMiddleware.protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ email: req.params.email }).sort({ appointmentDate: -1 });
    return res.json(appointments);
  } catch (err) {
    console.error('Error fetching patient appointments', err);
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
