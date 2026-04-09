const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  departmentId: {
    type: String,
    unique: true
  },
  departmentName: {
    type: String,
    required: true,
    unique: true
  },
  headOfDepartment: {
    type: String,
    required: true
  },
  
  // Details fields
  slug: {
    type: String
  },
  icon: {
    type: String
  },
  image: {
    type: String
  },
  bannerImage: {
    type: String
  },
  short: {
    type: String
  },
  subtitle: {
    type: String
  },
  description: {
    type: String
  },
  
  // Medical info fields
  treatments: [{
    type: String
  }],
  faqs: [{
    q: { type: String },
    a: { type: String }
  }],
  doctorId: [{
    type: String
  }],
  
  // Additional fields
  numberOfDoctors: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema);
