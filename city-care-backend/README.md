# City Care Hospital Backend

Backend API for City Care Hospital Management System.

## Features

- **Doctor Management**: CRUD operations for doctors
- **Department Management**: CRUD operations for departments  
- **Appointment Management**: Existing appointment system
- **MongoDB Integration**: Full database connectivity
- **RESTful API**: Standard REST endpoints

## API Endpoints

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `GET /api/doctors/by-department?department=Cardiology` - Get doctors by department
- `POST /api/doctors` - Add new doctor
- `PUT /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Delete doctor

### Departments
- `GET /api/departments` - Get all departments
- `GET /api/departments/:id` - Get department by ID
- `POST /api/departments` - Add new department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Appointments
- Existing appointment endpoints...

## Setup Instructions

### 1. Install Dependencies
```bash
cd city-care-backend
npm install
```

### 2. Environment Setup
Ensure `.env` file contains:
```
MONGO_URI=mongodb://your-connection-string
PORT=5000
```

### 3. Seed Departments (Optional)
```bash
npm run seed-departments
```

### 4. Start Server
```bash
npm start
```

Server will run on: `http://localhost:5000`

## Database Models

### Doctor Model
```javascript
{
  doctorId: String (unique, auto-generated),
  slug: String (unique, auto-generated),
  mobile: String,
  doctorName: String,
  email: String (unique),
  departmentName: String,
  experience: String,
  qualification: String,
  consultationFee: Number,
  icon: String,
  availability: String,
  status: String ('Active' | 'Inactive')
}
```

### Department Model
```javascript
{
  name: String (unique),
  head: String,
  status: String ('Active' | 'Inactive')
}
```

## Error Handling

- **400**: Bad Request (validation errors, duplicates)
- **404**: Not Found (resource doesn't exist)
- **500**: Internal Server Error (database/connection issues)

## Testing

Test endpoints using:
- Postman
- curl commands
- Angular frontend

Example curl:
```bash
# Get all doctors
curl http://localhost:5000/api/doctors

# Add doctor
curl -X POST http://localhost:5000/api/doctors \
  -H "Content-Type: application/json" \
  -d '{"doctorName":"Dr. Test","email":"test@example.com","departmentName":"Cardiology"}'
```
