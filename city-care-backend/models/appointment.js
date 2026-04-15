const mongoose = require('mongoose');

const statusEnum = ['pending', 'confirmed', 'cancelled', 'completed'];

const StatusHistorySchema = new mongoose.Schema({
  status: { type: String, enum: statusEnum, required: true },
  updatedAt: { type: Date, required: true, default: Date.now },
  updatedBy: { type: String, required: true }
});

const AppointmentSchema = new mongoose.Schema({
  patientName: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  email: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  doctorName: { type: String, required: true, trim: true },
  consultationFee: { type: Number, default: 0 },
  appointmentDate: { type: Date, required: true },
  appointmentCode: { type: String, unique: true },
  timeSlot: { type: String, required: true },
  status: { type: String, enum: statusEnum, default: 'pending' },
  notes: { type: String, default: 'pending' },
  statusHistory: { type: [StatusHistorySchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);
