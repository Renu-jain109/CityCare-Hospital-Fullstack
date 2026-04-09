const express = require('express');
const router = express.Router();
const {
  getAllDepartments,
  getDepartmentById,
  addDepartment,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController');

// GET /api/departments - Get all departments
router.get('/', getAllDepartments);

// GET /api/departments/:id - Get department by ID
router.get('/:id', getDepartmentById);

// POST /api/departments - Add new department
router.post('/', addDepartment);

// PUT /api/departments/:id - Update department
router.put('/:id', updateDepartment);

// DELETE /api/departments/:id - Delete department
router.delete('/:id', deleteDepartment);

module.exports = router;
