const Doctor = require('../models/doctor');

// Get all doctors
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get only Active doctors (for patient side)
const getActiveDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: 'Active' }).sort({ createdAt: -1 });
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get doctor by ID
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ doctorId: req.params.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get doctors by department (only Active doctors for patient side)
const getDoctorsByDepartment = async (req, res) => {
  try {
    const { department, activeOnly } = req.query;
    if (!department) {
      return res.status(400).json({ message: 'Department parameter is required' });
    }
    
    const query = { departmentName: department };
    if (activeOnly === 'true') {
      query.status = 'Active';
    }
    
    const doctors = await Doctor.find(query).sort({ createdAt: -1 });
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add new doctor
const addDoctor = async (req, res) => {
  try {
    const doctorData = req.body;
    
    // Check if doctor with same email already exists
    const existingDoctor = await Doctor.findOne({ email: doctorData.email });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor with this email already exists' });
    }
    
    // Generate doctorId and slug
    const count = await Doctor.countDocuments();
    doctorData.doctorId = `DOC-${count + 1}`;
    doctorData.slug = doctorData.doctorName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const doctor = new Doctor(doctorData);
    const savedDoctor = await doctor.save();
    
    res.status(201).json({
      message: 'Doctor added successfully',
      doctor: savedDoctor
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyValue)[0];
      res.status(400).json({ message: `Doctor with this ${field} already exists` });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// Update doctor
const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const doctor = await Doctor.findOneAndUpdate(
      { doctorId: id },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.status(200).json({
      message: 'Doctor updated successfully',
      doctor: doctor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete doctor
const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doctor = await Doctor.findOneAndDelete({ doctorId: id });
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.status(200).json({
      message: 'Doctor deleted successfully',
      doctor: doctor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllDoctors,
  getActiveDoctors,
  getDoctorById,
  getDoctorsByDepartment,
  addDoctor,
  updateDoctor,
  deleteDoctor
};
