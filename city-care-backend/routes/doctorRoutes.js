const express = require('express');
const router = express.Router();
const {
  getAllDoctors,
  getDoctorById,
  getDoctorsByDepartment,
  addDoctor,
  updateDoctor,
  deleteDoctor
} = require('../controllers/doctorController');

// GET /api/doctors - Get all doctors
router.get('/', getAllDoctors);

// GET /api/doctors/by-department - Get doctors by department
router.get('/by-department', getDoctorsByDepartment);

// GET /api/doctors/:id - Get doctor by ID
router.get('/:id', getDoctorById);

// POST /api/doctors - Add new doctor
router.post('/', addDoctor);

// PUT /api/doctors/:id - Update doctor
router.put('/:id', updateDoctor);

// DELETE /api/doctors/:id - Delete doctor
router.delete('/:id', deleteDoctor);

module.exports = router;
