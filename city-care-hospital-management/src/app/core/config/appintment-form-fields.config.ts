import { inject } from "@angular/core";
import { DynamicFormInterface } from "../../shared/ui/interfaces/dynamic-form-interface";

export const Appointment_Form_Fields: DynamicFormInterface[] = [
  // Patient Information
  { key: 'patientName', label: 'Patient Name', type: 'text', placeholder: 'Enter Patient Name', required: true },
  { key: 'age', label: 'Age', type: 'number', placeholder: 'Enter Age', required: true , colSpan: 1},
  { key: 'gender', label: 'Gender', type: 'select', options: [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' }
  ], required: true, colSpan: 1 },
  { key: 'mobile', label: 'Contact Number', type: 'text', placeholder: 'Enter Contact Number', required: true },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'Enter Email Address', required: true },
  
  // Appointment Details
  { key: 'department', label: 'Department', type: 'select', options: [], placeholder: 'Select Department', required: true, colSpan: 1 },
  { key: 'doctorName', label: 'Doctor Name', type: 'select', options: [], placeholder: 'Select Doctor', required: true, colSpan: 1 },
  { key: 'appointmentDate', label: 'Date', type: 'date', placeholder: 'Select Date', required: true, colSpan: 1, rows: 1 },
  { key: 'timeSlot', label: 'Time Slot', type: 'select', options: [], placeholder: 'Select Time Slot', required: true, colSpan: 1, rows: 1 }
];

