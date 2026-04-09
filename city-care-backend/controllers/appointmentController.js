const Slot = require('../models/Slot');
const Appointment = require('../models/appointment');

exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, timeSlot, patientName, email, mobile, age, gender, department } = req.body;

    // Check if slot exists and is free
    const slot = await Slot.findOne({ doctorId, date: appointmentDate, time: timeSlot });
    if (!slot || slot.isBooked) {
      return res.status(400).json({ message: "This slot is already booked. Please choose another." });
    }

    // Create appointment
    const appointment = new Appointment({
      patientName,
      email,
      mobile,
      age,
      gender,
      department,
      doctorName: slot.doctorName,
      appointmentDate,
      timeSlot
    });

    await appointment.save();

    // Mark slot as booked
    slot.isBooked = true;
    await slot.save();

    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSlotsByDate = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    const slots = await Slot.find({ doctorId, date });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({});
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update appointment
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log('Updating appointment with ID:', id);
    console.log('Update data:', updateData);
    
    // Find appointment by appointmentCode first (string ID), not _id
    let appointment;
    if (id.startsWith('APT-')) {
      appointment = await Appointment.findOne({ appointmentCode: id });
    } else {
      appointment = await Appointment.findById(id);
    }
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Update appointment fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        appointment[key] = updateData[key];
      }
    });
    
    await appointment.save();
    
    console.log('Appointment updated successfully:', appointment);
    res.json(appointment);
  } catch (err) {
    console.error('Error updating appointment:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    // Find appointment by appointmentCode first (string ID), not _id
    let appointment;
    if (id.startsWith('APT-')) {
      appointment = await Appointment.findOne({ appointmentCode: id });
    } else {
      appointment = await Appointment.findById(id);
    }
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Update status and add to status history
    const statusUpdate = {
      status,
      notes,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user?.name || 'System'
    };
    
    // Add to status history if it doesn't exist
    if (!appointment.statusHistory) {
      appointment.statusHistory = [];
    }
    
    appointment.statusHistory.push(statusUpdate);
    appointment.status = status;
    
    await appointment.save();
    
    res.json({ 
      message: 'Appointment status updated successfully',
      appointment: {
        ...appointment.toObject(),
        statusHistory: appointment.statusHistory
      }
    });
  } catch (err) {
    console.error('Error updating appointment status:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find appointment by appointmentCode first (string ID), not _id
    let appointment;
    if (id.startsWith('APT-')) {
      appointment = await Appointment.findOne({ appointmentCode: id });
    } else {
      appointment = await Appointment.findById(id);
    }
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    await Appointment.deleteOne({ _id: appointment._id });
    
    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
