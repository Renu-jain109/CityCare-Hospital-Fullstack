const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  doctorId: {
    type: String,
    unique: true
  },
  slug: {
    type: String,
    unique: true
  },
  mobile: {
    type: String,
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  departmentName: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  consultationFee: {
    type: Number,
    required: true
  },
  qualification: {
    type: String,
    required: true
  },
  availability: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);
