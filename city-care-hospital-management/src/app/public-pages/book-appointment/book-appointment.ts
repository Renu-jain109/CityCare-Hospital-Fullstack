import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Heading } from "../../shared/ui/heading/heading";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Button } from '../../shared/ui/button/button';
import { DynamicForm } from "../../shared/ui/dynamic-form/dynamic-form";
import { DynamicFormInterface } from '../../shared/ui/interfaces/dynamic-form-interface';
import { ButtonInterface } from '../../shared/ui/interfaces/button-interface';
import { Appointment_Form_Fields } from '../../core/config/appintment-form-fields.config';
import { DoctorService } from '../../core/services/doctor-service';
import { DepartmentService } from '../../core/services/department-service';
import { AppointmentService } from '../../core/services/appointment-service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from '../../shared/components/confirmation-dialog/confirmation-dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, Heading, Button, FormsModule, ReactiveFormsModule, DynamicForm, MatDatepickerModule, MatFormFieldModule, MatInputModule, MatNativeDateModule],
  templateUrl: './book-appointment.html',
  styleUrl: './book-appointment.css',

})
export class BookAppointment implements OnInit {

  submitted = false;
  appointmentForm!: FormGroup;
  fb = inject(FormBuilder)
  departmentService = inject(DepartmentService)
  appointmentService = inject(AppointmentService)
  route = inject(ActivatedRoute)
  doctorService = inject(DoctorService)
  router = inject(Router)
  http = inject(HttpClient)
  constructor(public dialog: MatDialog) { }


  timeSlots = [
    '09:00 AM', '09:30 AM',
    '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM',
    '12:00 PM',

    '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM',
    '05:00 PM'
  ];


  buttons: ButtonInterface[] = [
    {
      label: 'Book Appointment',
      color: 'primary',
      type: 'submit',
      icon: 'fa-solid fa-plus',
      customClass: 'flex justify-center'
    }
  ];


  appintmentFields: DynamicFormInterface[] = [];

  ngOnInit() {
    this.appointmentForm = this.fb.group({});

    this.appintmentFields = structuredClone(Appointment_Form_Fields);

    // Note: Form controls are now created by dynamic-form component with proper validation

    this.appointmentForm.get('appointmentDate')?.valueChanges.subscribe(date => {
      const doctorId = this.appointmentForm.value.doctor;
      if (doctorId && date) {
        this.appointmentService.getSlotByDate(doctorId, date).subscribe((slots: any[]) => {
          const slotOptions: any = slots.map(slot => ({
            label: slot.time,
            value: slot.time,
            disabled: slot.isBooked   // disable booked slots
          }));
          this.setSelectOptions('timeSlot', slotOptions);
        });
      }
    });



    // Get Departments from backend
    this.departmentService.getAllDepartmentsFromBackend().subscribe(departments => {
      const departmentOptions = departments.map((dept: any) => dept.departmentName);
      this.setSelectOptions('department', departmentOptions);
    });

    // Initially doctor empty
    this.setSelectOptions('doctor', []);

    // Time Slot
    this.setSelectOptions('timeSlot', this.timeSlots);



    // Update doctors when department changes
    this.appointmentForm.get('department')?.valueChanges.subscribe(departmentName => {
      console.log('select department', departmentName);

      if (departmentName) {
        this.doctorService.getDoctorsByDepartment(departmentName).subscribe({
          next: (doctors) => {
            console.log('Doctors received from backend:', doctors);
            const doctorOptions = doctors.map((doc: any) => doc.doctorName);
            console.log('Doctor options for dropdown:', doctorOptions);
            this.setSelectOptions('doctorName', doctorOptions);
          },
          error: (error) => {
            console.error('Error loading doctors:', error);
            this.setSelectOptions('doctorName', []);
          }
        });
      } else {
        this.setSelectOptions('doctorName', []);
      }

      // Reset doctor when department changes
      this.appointmentForm.patchValue({ doctorName: '' });
    })



    // Department auto-select

    this.route.queryParams.subscribe(params => {
      if (params['department']) {
        this.appointmentForm.patchValue({
          department: params['department']
        });
        console.log(params['department']);

        // Trigger valueChanges to load doctors for the pre-selected department
        this.appointmentForm.get('department')?.updateValueAndValidity();
      }

      if (params['doctor']) {
        this.appointmentForm.patchValue({
          doctor: params['doctor']
        })
        console.log(params['doctor']);

      }
    })


  }

  selectSlot(slot: any) {
    if (slot.isBooked) {
      this.appointmentForm.patchValue({ timeSlot: slot.timeSlot });
    }
  }


  setSelectOptions(key: string, data: string[] | { label: string; value: any; disabled?: boolean }[]) {
    const field = this.appintmentFields.find(f => f.key === key);
    if (field) {
      if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && 'label' in data[0]) {
        field.options = data as { label: string; value: any; disabled?: boolean }[];
      } else {
        field.options = (data as string[]).map(item => ({ label: item, value: item }));
      }
      this.appintmentFields = [...this.appintmentFields];
    }
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      return;
    }

    this.appointmentService.bookAppointment(this.appointmentForm.value).subscribe({
      next: (appointment) => {
        const formattedDate = new Date(appointment.appointmentDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

        // Get consultation fee from the selected doctor
        this.doctorService.getAllDoctors().subscribe(doctors => {
          const selectedDoctor = doctors.find((doc: any) => doc.doctorName === appointment.doctorName);
          const consultationFee = selectedDoctor?.consultationFee || appointment.consultationFee || 'Will be informed';

          this.dialog.open(ConfirmationDialog, {
            width: '500px',
            data: {
              title: 'Appointment Confirmed!',
              message: `
              <div style="text-align: left; line-height: 1.6;">
                <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #3b82f6;">
                  <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 18px;">🎉 Appointment Details</h3>
                  <p><strong>Patient Name:</strong> ${appointment.patientName}</p>
                  <p><strong>Age/Gender:</strong> ${appointment.age} / ${appointment.gender}</p>
                  <p><strong>Contact:</strong> ${appointment.mobile}</p>
                  <p><strong>Email:</strong> ${appointment.email}</p>
                </div>
                
                <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #22c55e;">
                  <h3 style="margin: 0 0 10px 0; color: #166534; font-size: 18px;">📅 Schedule</h3>
                  <p><strong>Department:</strong> ${appointment.department}</p>
                  <p><strong>Doctor:</strong> ${appointment.doctorName}</p>
                  <p><strong>Date:</strong> ${formattedDate}</p>
                  <p><strong>Time:</strong> ${appointment.timeSlot}</p>
                </div>
                
                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                  <h3 style="margin: 0 0 10px 0; color: #92400e; font-size: 18px;">💰 Consultation Fee</h3>
                  <p style="font-size: 18px; font-weight: bold; color: #dc2626;">₹${consultationFee}</p>
                  <p style="font-size: 12px; color: #666; margin-top: 5px;">Please pay this amount at the hospital reception</p>
                </div>
                
                <div style="background: #f3f4f6; padding: 10px; border-radius: 4px; margin-top: 15px;">
                  <p style="margin: 0; font-size: 12px; color: #666;"><strong>Appointment Code:</strong> ${appointment.appointmentCode}</p>
                </div>
              </div>
              `
            }
          });
        });

      },

      error: (err: any) => {
        console.error('Failed to book appointment', err);
        alert('Unable to book appointment. Please try again.');
      }
    });
  }


  goHome() {
    // window.location.href = '/';
    this.router.navigate(['/']);
  }

  resetForm() {
    this.submitted = false;
    // this.bookedAppointment = null;
    this.appointmentForm?.reset();
  }

}
