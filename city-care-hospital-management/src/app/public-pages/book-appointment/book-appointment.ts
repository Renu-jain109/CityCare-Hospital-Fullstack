import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { Heading } from "../../shared/ui/heading/heading";
import { Card } from "../../shared/ui/card/card";
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
import { AuthService } from '../../core/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from '../../shared/components/confirmation-dialog/confirmation-dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, Heading, Card, Button, FormsModule, ReactiveFormsModule, DynamicForm, MatDatepickerModule, MatFormFieldModule, MatInputModule, MatNativeDateModule],
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
  authService = inject(AuthService)
  router = inject(Router)
  http = inject(HttpClient)
  sanitizer = inject(DomSanitizer)
  constructor(public dialog: MatDialog) { }

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
  doctorsList: any[] = [];
  noDoctorsMessage: string = '';
  preFilledDepartment: string | null = null;
  preFilledDoctor: string | null = null;

  ngOnInit() {
    this.appointmentForm = this.fb.group({});

    this.appintmentFields = structuredClone(Appointment_Form_Fields);

    setTimeout(() => {
      const dateControl = this.appointmentForm.get('appointmentDate');
      if (dateControl) {
        dateControl.valueChanges.subscribe(date => {
          // Use preFilledDoctor if doctor field is disabled, otherwise get from form
          const doctorName = this.preFilledDoctor || this.appointmentForm.getRawValue().doctorName;
          // Lookup doctorId from stored doctors list
          const selectedDoctor = this.doctorsList.find((doc: any) => doc.doctorName === doctorName);
          const doctorId = selectedDoctor?.doctorId || selectedDoctor?._id || selectedDoctor?.id;

          // Convert date to ISO format (yyyy-mm-dd) for API
          let formattedDate = date;
          if (date instanceof Date) {
            formattedDate = date.toISOString().split('T')[0];
          } else if (typeof formattedDate === 'string' && formattedDate.includes('-')) {
            const parts = formattedDate.split('-');
            if (parts.length === 3 && parts[0].length === 2) {
              // Convert from dd-mm-yyyy to yyyy-mm-dd
              formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
          }

          console.log('Frontend - doctorId sent:', doctorId, 'doctorName:', doctorName);
          if (doctorId && formattedDate) {
            this.appointmentService.getSlotByDate(doctorId, formattedDate).subscribe((slots: any[]) => {
              console.log('Slots from backend:', slots);
              // Show all slots - booked ones will be disabled (no color change)
              const allSlots = slots.map(slot => ({
                label: slot.time,
                value: slot.time,
                disabled: slot.isBooked
              }));
              console.log('Processed slots:', allSlots);
              this.setSelectOptions('timeSlot', allSlots);
            });
          }
        });
      }
    }, 0);



    // Load only Active departments for patient booking
    this.departmentService.getActiveDepartments().subscribe(departments => {
      const departmentOptions = departments.map((dept: any) => dept.departmentName);
      this.setSelectOptions('department', departmentOptions);
    });

    // Update doctors when department changes
    // Use setTimeout to ensure form controls are created by dynamic-form component first
    setTimeout(() => {
      const departmentControl = this.appointmentForm.get('department');
      if (departmentControl) {
        departmentControl.valueChanges.subscribe(departmentName => {
          if (departmentName) {
            // Load only Active doctors for patient booking
            this.doctorService.getDoctorsByDepartment(departmentName, true).subscribe({
              next: (doctors) => {
                this.doctorsList = doctors;
                if (doctors.length === 0) {
                  // No active doctors available for this department
                  this.noDoctorsMessage = `No doctors are currently available in ${departmentName} department. Please select a different department or try again later.`;
                  this.setSelectOptions('doctorName', []);
                } else {
                  this.noDoctorsMessage = '';
                  const doctorOptions = doctors.map((doc: any) => ({
                    label: doc.doctorName,
                    value: doc.doctorName
                  }));
                  this.setSelectOptions('doctorName', doctorOptions);
                }
              },
              error: () => {
                this.setSelectOptions('doctorName', []);
                this.doctorsList = [];
                this.noDoctorsMessage = `Unable to load doctors for ${departmentName} department. Please try again.`;
              }
            });
          } else {
            this.setSelectOptions('doctorName', []);
            this.doctorsList = [];
            this.noDoctorsMessage = '';
          }
          this.appointmentForm.patchValue({ doctorName: '' });
        });
      }
    }, 0);



    this.route.queryParams.subscribe(params => {
      if (params['department']) {
        this.preFilledDepartment = params['department'];
        this.appointmentForm.patchValue({ department: params['department'] });
        this.appointmentForm.get('department')?.updateValueAndValidity();
        // Disable department field when pre-filled
        this.appointmentForm.get('department')?.disable();
        // Hide department field from form
        this.hideDepartmentField();
        // Automatically load doctors for pre-filled department
        this.loadDoctorsForDepartment(params['department']);
      }
      if (params['doctor']) {
        this.preFilledDoctor = params['doctor'];
        // Store pre-filled doctor to set after doctors are loaded
      }
    });


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

  hideDepartmentField() {
    // Remove department field from visible form fields
    this.appintmentFields = this.appintmentFields.filter(f => f.key !== 'department');
  }

  loadDoctorsForDepartment(departmentName: string): void {
    // Load only Active doctors for patient booking
    this.doctorService.getDoctorsByDepartment(departmentName, true).subscribe({
      next: (doctors) => {
        this.doctorsList = doctors;
        if (doctors.length === 0) {
          this.noDoctorsMessage = `No doctors are currently available in ${departmentName} department. Please try again later.`;
          this.setSelectOptions('doctorName', []);
        } else {
          this.noDoctorsMessage = '';
          const doctorOptions = doctors.map((doc: any) => ({
            label: doc.doctorName,
            value: doc.doctorName
          }));
          this.setSelectOptions('doctorName', doctorOptions);

          // If doctor is pre-filled, set it and hide the field
          if (this.preFilledDoctor) {
            this.appointmentForm.patchValue({ doctorName: this.preFilledDoctor });
            this.appointmentForm.get('doctorName')?.disable();
            this.hideDoctorField();
          }
        }
      },
      error: () => {
        this.setSelectOptions('doctorName', []);
        this.doctorsList = [];
        this.noDoctorsMessage = `Unable to load doctors for ${departmentName} department. Please try again.`;
      }
    });
  }

  hideDoctorField() {
    // Remove doctorName field from visible form fields
    this.appintmentFields = this.appintmentFields.filter(f => f.key !== 'doctorName');
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      return;
    }

    // Prepare data with proper types for backend
    // Use getRawValue() to include disabled fields (pre-filled department/doctor)
    const formData = this.appointmentForm.getRawValue();

    // Lookup doctorId from selected doctorName
    const selectedDoctor = this.doctorsList.find((doc: any) => doc.doctorName === formData.doctorName);
    const doctorId = selectedDoctor?.doctorId || selectedDoctor?._id || selectedDoctor?.id;

    // Convert date to ISO format (yyyy-mm-dd)
    let formattedDate = formData.appointmentDate;

    // Handle Date object or string
    if (formData.appointmentDate instanceof Date) {
      formattedDate = formData.appointmentDate.toISOString().split('T')[0]; // yyyy-mm-dd
    } else if (typeof formattedDate === 'string' && formattedDate.includes('-')) {
      const parts = formattedDate.split('-');
      if (parts.length === 3 && parts[0].length === 2) {
        // Convert from dd-mm-yyyy to yyyy-mm-dd
        formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    // Get logged-in user's email (the person making the booking)
    const currentUser = this.authService.currentUser();
    const bookedByEmail = currentUser?.email || null;

    const appointmentData = {
      ...formData,
      department: this.preFilledDepartment || formData.department,
      doctorName: this.preFilledDoctor || formData.doctorName,
      appointmentDate: formattedDate,
      doctorId: doctorId,
      age: Number(formData.age),
      bookedBy: bookedByEmail // Track who made the booking (for family appointments)
    };

    console.log('Sending appointment data:', JSON.stringify(appointmentData, null, 2));

    this.appointmentService.bookAppointment(appointmentData).subscribe({
      next: (appointment) => {
        const formattedDate = new Date(appointment.appointmentDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

        // Get consultation fee from the selected doctor
        this.doctorService.getAllDoctors().subscribe(doctors => {
          const selectedDoctor = doctors.find((doc: any) => doc.doctorName === appointment.doctorName);
          const consultationFee = selectedDoctor?.consultationFee || appointment.consultationFee || 'Will be informed';

          const htmlContent = `
        <!-- Hospital Banner -->
        <div style="background: #005EB8; padding: 12px; border-radius: 10px; text-align: center; color: white; margin-bottom: 12px;">
          <div style="font-size: 20px; margin-bottom: 4px;">🏥</div>
          <h3 style="margin: 0; font-size: 16px; font-weight: bold;">City Care Hospital</h3>
          <p style="margin: 2px 0 0 0; font-size: 12px; opacity: 0.9;">Appointment Details</p>
        </div>

        <!-- Appointment Information Card -->
        <div style="background: white; padding: 12px; border-radius: 10px; margin-bottom: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h4 style="color: #005EB8; margin: 0 0 10px 0; font-size: 14px; display: flex; align-items: center; gap: 6px;">
            <span>📋</span> Appointment Information
          </h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Appointment ID</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${appointment.appointmentCode || 'N/A'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Status</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #10b981; font-size: 13px;">${appointment.status || 'N/A'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Patient Name</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${appointment.patientName || 'N/A'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Mobile</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${appointment.mobile || 'N/A'}</p>
            </div>
          </div>
        </div>

        <!-- Schedule Information Card -->
        <div style="background: white; padding: 12px; border-radius: 10px; margin-bottom: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h4 style="color: #005EB8; margin: 0 0 10px 0; font-size: 14px; display: flex; align-items: center; gap: 6px;">
            <span>📅</span> Schedule Information
          </h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Date</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${formattedDate || 'N/A'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Time Slot</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${appointment.timeSlot || 'N/A'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Duration</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${appointment.duration || '30 minutes'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Type</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${appointment.appointmentType || 'Regular'}</p>
            </div>
          </div>
        </div>

        <!-- Medical Details Card -->
        <div style="background: white; padding: 12px; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h4 style="color: #005EB8; margin: 0 0 10px 0; font-size: 14px; display: flex; align-items: center; gap: 6px;">
            <span>🏥</span> Medical Details
          </h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Department</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${appointment.department || 'N/A'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Doctor</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${appointment.doctorName || 'N/A'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Specialization</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${selectedDoctor?.specialization || 'N/A'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Consultation Fee</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #10b981; font-size: 13px;">₹${consultationFee}</p>
            </div>
          </div>
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 12px; color: #666; text-align: center;">Your appointment request has been submitted. Waiting for confirmation.</p>
          </div>
        </div>
          `;

          this.dialog.open(ConfirmationDialog, {
            width: '650px',
            data: {
              title: 'Appointment Confirmed!',
              message: this.sanitizer.bypassSecurityTrustHtml(htmlContent)
            }
          });

          // Reset form after successful booking
          this.resetForm();

          // Notify other tabs about the new appointment
          if (typeof window !== 'undefined') {
            localStorage.setItem('appointments_updated', Date.now().toString());
            setTimeout(() => {
              localStorage.removeItem('appointments_updated');
            }, 1000);
          }
        });

      },

      error: (err: any) => {
        console.error('Full error object:', err);
        console.error('Error status:', err.status);
        console.error('Error body:', err.error);
        const errorMsg = err.error?.message || err.error || err.message || 'Unknown error';
        alert(`Unable to book appointment. Error: ${errorMsg}`);
      }
    });
  }

  goHome() {
    this.router.navigate(['/']);
  }

  resetForm() {
    this.submitted = false;
    this.appointmentForm?.reset();
  }
}
