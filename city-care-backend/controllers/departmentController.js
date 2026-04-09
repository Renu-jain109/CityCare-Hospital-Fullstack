const Department = require('../models/department');

// Get all departments
const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get department by ID
const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.status(200).json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add new department
const addDepartment = async (req, res) => {
  try {
    const departmentData = req.body;
    
    console.log('Adding department with data:', departmentData);
    
    // Check if department with same name already exists
    const existingDepartment = await Department.findOne({ departmentName: departmentData.departmentName });
    if (existingDepartment) {
      return res.status(400).json({ message: 'Department with this name already exists' });
    }
    
    // Process array fields properly
    if (departmentData.treatments && typeof departmentData.treatments === 'string') {
      departmentData.treatments = departmentData.treatments.split(',').map(t => t.trim()).filter(t => t);
    }
    
    if (departmentData.faqs && typeof departmentData.faqs === 'string') {
      departmentData.faqs = departmentData.faqs.split('||').map(faq => {
        const parts = faq.split('?');
        if (parts.length >= 2) {
          return {
            q: parts[0].trim(),
            a: parts.slice(1).join('?').trim()
          };
        }
        return null;
      }).filter(faq => faq !== null);
    }
    
    // Handle doctorIds from form and map to doctorId for backend
    if (departmentData.doctorIds && typeof departmentData.doctorIds === 'string') {
      departmentData.doctorId = departmentData.doctorIds.split(',').map(id => id.trim()).filter(id => id);
      delete departmentData.doctorIds; // Remove form field name
    } else if (departmentData.doctorId && typeof departmentData.doctorId === 'string') {
      departmentData.doctorId = departmentData.doctorId.split(',').map(id => id.trim()).filter(id => id);
    }
    
    // Generate departmentId
    const count = await Department.countDocuments();
    departmentData.departmentId = `DEPT${count + 1}`;
    
    console.log('Processed department data:', departmentData);
    
    const department = new Department(departmentData);
    const savedDepartment = await department.save();
    
    res.status(201).json({
      message: 'Department added successfully',
      department: savedDepartment
    });
  } catch (error) {
    console.error('Error adding department:', error);
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyValue)[0];
      res.status(400).json({ message: `Department with this ${field} already exists` });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// Update department
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log('Updating department with ID:', id);
    console.log('Update data:', updateData);
    
    // Process array fields properly
    if (updateData.treatments && typeof updateData.treatments === 'string') {
      updateData.treatments = updateData.treatments.split(',').map(t => t.trim()).filter(t => t);
    }
    
    if (updateData.faqs && typeof updateData.faqs === 'string') {
      updateData.faqs = updateData.faqs.split('||').map(faq => {
        const parts = faq.split('?');
        if (parts.length >= 2) {
          return {
            q: parts[0].trim(),
            a: parts.slice(1).join('?').trim()
          };
        }
        return null;
      }).filter(faq => faq !== null);
    }
    
    // Handle both doctorIds (from form) and doctorId (backend model)
    if (updateData.doctorIds && typeof updateData.doctorIds === 'string') {
      updateData.doctorId = updateData.doctorIds.split(',').map(id => id.trim()).filter(id => id);
      delete updateData.doctorIds; // Remove the form field name
    } else if (updateData.doctorId && typeof updateData.doctorId === 'string') {
      updateData.doctorId = updateData.doctorId.split(',').map(id => id.trim()).filter(id => id);
    }
    
    console.log('Processed update data:', updateData);
    
    // Always try to find by departmentId first (since that's what we're using)
    let department = await Department.findOneAndUpdate(
      { departmentId: id },
      updateData,
      { new: true, runValidators: true }
    );
    
    // If not found by departmentId, try by _id
    if (!department && id.match(/^[0-9a-fA-F]{24}$/)) {
      department = await Department.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
    }
    
    if (!department) {
      console.log('Department not found with ID:', id);
      return res.status(404).json({ message: 'Department not found' });
    }
    
    console.log('Department updated successfully:', department);
    res.status(200).json({
      message: 'Department updated successfully',
      department: department
    });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete department
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find department by departmentId first (string ID), not _id
    let department;
    if (id.startsWith('dept')) {
      department = await Department.findOne({ departmentId: id });
    } else {
      department = await Department.findById(id);
    }
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Delete the department
    await Department.deleteOne({ _id: department._id });
    
    res.status(200).json({
      message: 'Department deleted successfully',
      department: department
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  addDepartment,
  updateDepartment,
  deleteDepartment
};
