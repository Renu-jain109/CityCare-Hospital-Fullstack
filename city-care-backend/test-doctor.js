try {
  require('dotenv').config();
} catch(e) {
  console.log('dotenv not loaded, using default MongoDB URI');
}

const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital';
console.log('Connecting to:', MONGODB_URI);

mongoose.connect(MONGODB_URI);

console.log('Current directory:', __dirname);
console.log('Attempting to load doctor model...');

try {
  const Doctor = require('./models/Doctor');
  console.log('Doctor model loaded successfully');
} catch(e) {
  console.error('Error loading doctor model:', e.message);
  process.exit(1);
}

async function checkDoctors() {
  try {
    console.log('\n=== ALL DOCTORS ===\n');
    const doctors = await Doctor.find({});
    
    doctors.forEach(doc => {
      console.log(`Doctor: ${doc.doctorName}`);
      console.log(`  ID: ${doc.doctorId}`);
      console.log(`  Availability: "${doc.availability}"`);
      console.log(`  Department: ${doc.departmentName}`);
      console.log('---');
    });
    
    console.log(`\nTotal doctors: ${doctors.length}`);
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    mongoose.disconnect();
  }
}

checkDoctors();
