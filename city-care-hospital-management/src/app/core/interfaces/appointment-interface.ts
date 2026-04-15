import { Time } from "@angular/common";

export interface AppointmentInterface {
  appointmentCode: string;
  _id?: string;
  patientName: string;
  mobile: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  bookedBy?: string; // Email of user who booked (for family appointments)
  department: string;
  doctorName: string;
  appointmentDate: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  notes?: string;

  statusHistory: {
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    updatedAt: string;
    updatedBy: string;
  }[];
}
