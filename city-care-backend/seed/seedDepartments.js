const mongoose = require('mongoose');
const Department = require('../models/department');
require('dotenv').config();

const seedDepartments = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing departments
    await Department.deleteMany({});
    console.log('Cleared existing departments');

    // Seed departments
    const departments = [
      { name: 'Cardiology', head: 'Dr. Aarav Sharma', status: 'Active' },
      { name: 'Neurology', head: 'Dr. Kavita Anand', status: 'Active' },
      { name: 'Orthopedics', head: 'Dr. Aditya Rao', status: 'Active' },
      { name: 'Pediatrics', head: 'Dr. Sonia Joshi', status: 'Active' },
      { name: 'Dermatology', head: 'Dr. Priya Gupta', status: 'Active' },
      { name: 'Gynecology', head: 'Dr. Riya Oberoi', status: 'Active' },
      { name: 'Oncology', head: 'Dr. Nishant Arora', status: 'Active' },
      { name: 'Gastroenterology', head: 'Dr. Hemant Batra', status: 'Active' },
      { name: 'ENT', head: 'Dr. Avni Sethi', status: 'Active' },
      { name: 'Urology', head: 'Dr. Manoj Nair', status: 'Active' },
      { name: 'Nephrology', head: 'Dr. Sunil Kumar', status: 'Active' },
      { name: 'Psychiatry', head: 'Dr. Anita Desai', status: 'Active' },
      { name: 'Dentistry', head: 'Dr. Karan Mehta', status: 'Active' },
      { name: 'Ophthalmology', head: 'Dr. Tanvi Rao', status: 'Active' },
      { name: 'Physiotherapy', head: 'Dr. Harsh Yadav', status: 'Active' },
      { name: 'General Medicine', head: 'Dr. Rohan Singh', status: 'Active' }
    ];

    await Department.insertMany(departments);
    console.log('Departments seeded successfully');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding departments:', error);
    process.exit(1);
  }
};

seedDepartments();
