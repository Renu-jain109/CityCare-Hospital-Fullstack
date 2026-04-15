const Appointment = require('../models/appointment');
const Doctor = require('../models/Doctor');

exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, timeSlot, patientName, email, mobile, age, gender, department, doctorName } = req.body;

    // Find the Doctor to get doctorName and consultationFee
    const doctor = await Doctor.findOne({ doctorId: doctorId });
    const actualDoctorName = doctorName || (doctor ? doctor.doctorName : doctorId);
    const consultationFee = doctor ? doctor.consultationFee : 0;

    // Create date range for the entire day
    const startDate = new Date(appointmentDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(appointmentDate);
    endDate.setHours(23, 59, 59, 999);

    // Check if slot is already booked in Appointment collection
    const existingAppointment = await Appointment.findOne({
      doctorName: actualDoctorName,
      appointmentDate: {
        $gte: startDate,
        $lte: endDate
      },
      timeSlot: timeSlot,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: "This slot is already booked. Please choose another." });
    }

    // Generate unique appointment code using timestamp
    const count = await Appointment.countDocuments();
    const appointmentCode = `APT-${count + 1}`;

    // Create appointment
    const appointment = new Appointment({
      patientName,
      email,
      mobile,
      age,
      gender,
      department,
      doctorName: actualDoctorName,
      consultationFee,
      appointmentDate,
      timeSlot,
      appointmentCode
    });

    await appointment.save();

    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSlotsByDate = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    // Find doctor to get availability
    const doctor = await Doctor.findOne({ doctorId: doctorId });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Parse availability string (e.g., "9 AM - 5 PM" or "09:00 - 17:00")
    const availability = doctor.availability || '9 AM - 5 PM';
    const timeSlots = generateTimeSlots(availability);

    // Check which slots are already booked
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      doctorName: doctor.doctorName,
      appointmentDate: { $gte: startDate, $lte: endDate },
      status: { $in: ['pending', 'confirmed'] }
    });

    const bookedSlots = bookedAppointments.map(apt => apt.timeSlot);

    // Generate slots with isBooked status
    const slots = timeSlots.map(time => ({
      doctorId,
      doctorName: doctor.doctorName,
      date: new Date(date),
      time: time,
      isBooked: bookedSlots.includes(time)
    }));

    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper function to generate time slots from availability string
function generateTimeSlots(availability) {
  const slots = [];

  // Trim and clean the availability string
  const cleanAvailability = availability.trim();

  // Parse availability string - handles multiple formats:
  // "9 AM - 5 PM", "09:00 - 17:00", "11:00 AM - 6:00 PM", "11 to 6", "11 se 6", etc.
  const match = cleanAvailability.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM|am|pm)?\s*(?:to|TO|se|SE|-)\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM|am|pm)?/i);

  if (!match) {
    // Default 9 AM to 5 PM if parsing fails
    return generateSlotsFromRange(9, 0, 17, 0);
  }

  let startHour = parseInt(match[1]);
  let startMin = match[2] ? parseInt(match[2]) : 0;
  let startPeriod = match[3] ? match[3].toUpperCase() : null;
  let endHour = parseInt(match[4]);
  let endMin = match[5] ? parseInt(match[5]) : 0;
  let endPeriod = match[6] ? match[6].toUpperCase() : null;

  // Handle 24-hour format (no AM/PM specified)
  // If no AM/PM and hours > 12, assume it's already in 24-hour format
  if (!startPeriod && startHour > 12) {
    // Keep as is (already 24-hour)
  } else if (!startPeriod && endHour > 12 && startHour <= 12) {
    // Infer: if end is > 12 and no AM/PM, assume end is PM
    endPeriod = 'PM';
    if (!startPeriod) startPeriod = 'AM';
  } else if (!startPeriod && !endPeriod) {
    // No AM/PM specified and both <= 12, assume AM for start, PM for end if end > start
    startPeriod = 'AM';
    endPeriod = endHour > startHour ? 'PM' : 'AM';
  }

  // Convert to 24-hour format
  if (startPeriod === 'PM' && startHour !== 12) startHour += 12;
  if (startPeriod === 'AM' && startHour === 12) startHour = 0;
  if (endPeriod === 'PM' && endHour !== 12) endHour += 12;
  if (endPeriod === 'AM' && endHour === 12) endHour = 0;

  return generateSlotsFromRange(startHour, startMin, endHour, endMin);
}

function generateSlotsFromRange(startHour, startMin, endHour, endMin) {
  const slots = [];
  let currentHour = startHour;
  let currentMin = startMin;

  while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
    const timeStr = formatTime(currentHour, currentMin);
    slots.push(timeStr);

    // Add 30 minutes
    currentMin += 30;
    if (currentMin >= 60) {
      currentMin = 0;
      currentHour++;
    }
  }

  return slots;
}

function formatTime(hour, min) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : (hour > 12 ? hour - 12 : hour);
  const displayMin = min.toString().padStart(2, '0');
  return `${displayHour}:${displayMin} ${period}`;
}

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
    res.json(appointment);
  } catch (err) {
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
