import { Component, OnInit, inject } from '@angular/core';
import { Table } from "../../../../shared/ui/table/table";
import { Heading } from "../../../../shared/ui/heading/heading";
import { Router } from '@angular/router';
import { AppointmentService } from '../../../../core/services/appointment-service';
import { AppointmentInterface } from '../../../../core/interfaces/appointment-interface';
import { MatDialog } from '@angular/material/dialog';
import { ButtonInterface } from '../../../../shared/ui/interfaces/button-interface';
import { Appointment_Form_Fields } from '../../../../core/config/appintment-form-fields.config';
import { ConfirmationDialog } from '../../../../shared/components/confirmation-dialog/confirmation-dialog';
import { DoctorService } from '../../../../core/services/doctor-service';
import { DepartmentService } from '../../../../core/services/department-service';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-appointment-list',
  imports: [Table, Heading, FormsModule],
  templateUrl: './appointment-list.html',
  styleUrl: './appointment-list.css',
})
export class AppointmentList implements OnInit {

  appointmentData: AppointmentInterface[] = [];
  filteredAppointmentData: AppointmentInterface[] = [];
  currentPage: number = 1;
  appointmentFields: any[] = [];
  dialog = inject(MatDialog);
  searchTerm: string = '';

  constructor(
    private router: Router,
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,
    private departmentService: DepartmentService,
    private sanitizer: DomSanitizer
  ) { }


  ngOnInit() {
    // Subscribe to real-time updates
    this.appointmentService.appointments$.subscribe(data => {
      // add `shortId` field so the table can render a shortened appointment id
      this.appointmentData = data.map((appointment) => ({
        ...appointment,
        shortId: appointment.appointmentCode
          ? `${appointment.appointmentCode.substring(0, 6)}...${appointment.appointmentCode.substring(14, 20)}`
          : ''
      }));

      // Initialize filtered data
      this.filteredAppointmentData = [...this.appointmentData];
    });

    // Initial load
    this.appointmentService.getAllAppointments().subscribe();
  }

  onSearchChange() {
    this.filteredAppointmentData = this.appointmentData.filter(appointment => {
      const searchLower = this.searchTerm.toLowerCase();
      return (
        appointment.patientName?.toLowerCase().includes(searchLower) ||
        appointment.doctorName?.toLowerCase().includes(searchLower) ||
        appointment.department?.toLowerCase().includes(searchLower) ||
        appointment.appointmentCode?.toLowerCase().includes(searchLower) ||
        (appointment as any).shortId?.toLowerCase().includes(searchLower) ||
        appointment.status?.toLowerCase().includes(searchLower)
      );
    });
  }

  appointmentColumns = [
    { key: 'shortId', label: 'Appointment ID' },
    { key: 'patientName', label: 'Patient Name' },
    { key: 'department', label: 'Department' },
    { key: 'doctorName', label: 'Doctor' },
    { key: 'status', label: 'Status' },
  ];

  appointmentActions = [
    {
      label: '<i class="fa-solid fa-ellipsis"></i>',
      action: 'menu',
      show: (row: any) => true,
      menuItems: [
        { label: 'View Details', action: 'view' },

        // Pending → Approve/Reject
        { label: 'Approve', action: 'confirm', show: (row: any) => row.status === 'pending' },
        { label: 'Reject', action: 'reject', show: (row: any) => row.status === 'pending' },

        // Confirmed → Cancel or Complete
        { label: 'Cancel/Reject', action: 'cancel', show: (row: any) => row.status === 'confirmed' },
        { label: 'Mark Complete', action: 'complete', show: (row: any) => row.status === 'confirmed' },

        // Completed → Invoice
        { label: 'Generate Invoice', action: 'invoice', show: (row: any) => row.status === 'completed' },

        { label: 'Edit', action: 'edit' },
        { label: 'Delete', action: 'delete' }
      ]
    }
  ];

  handleTableAction(event: { action: string, row: any }) {
    switch (event.action) {
      case 'confirm':
        this.updateAppointmentStatus(event.row, 'confirmed', 'Admin approved appointment');
        break;
      case 'reject':
        this.updateAppointmentStatus(event.row, 'cancelled', 'Admin rejected appointment');
        break;
      case 'cancel':
        this.updateAppointmentStatus(event.row, 'cancelled', 'Admin cancelled confirmed appointment');
        break;
      case 'edit':
        this.editAppointment(event.row);
        break;
      case 'complete':
        this.updateAppointmentStatus(event.row, 'completed', 'Admin marked appointment as completed');
        break;
      case 'invoice':
        this.generateInvoice(event.row);
        break;
      case 'delete':
        this.deleteAppointment(event.row);
        break;
      case 'view':
      const htmlContent = `
            <div style="text-align: left; line-height: 1.6; display: flex; gap: 15px;">

              <!-- Left Part: Appointment Information -->
              <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px 0; color: #2563eb; font-size: 18px;">📋 Appointment Information</h3>
                <p><strong>Appointment ID:</strong> ${event.row.appointmentCode || event.row.shortId || 'N/A'}</p>
                <p><strong>Patient Name:</strong> ${event.row.patientName || 'N/A'}</p>
                <p><strong>Mobile:</strong> ${event.row.mobile || 'N/A'}</p>
                <p><strong>Email:</strong> ${event.row.email || 'N/A'}</p>
                <p><strong>Status:</strong> <span style="color: ${this.getStatusColor(event.row.status)}; font-weight: bold;">● ${event.row.status || 'N/A'}</span></p>
              </div>

              <!-- Right Part: Schedule Information -->
              <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <h3 style="margin: 0 0 10px 0; color: #2563eb; font-size: 18px;">📅 Schedule Information</h3>
              <p><strong>Date:</strong> ${event.row.date ? new Date(event.row.date).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Time Slot:</strong> ${event.row.timeSlot || 'N/A'}</p>
              <p><strong>Duration:</strong> ${event.row.duration || '30 minutes'}</p>
              <p><strong>Appointment Type:</strong> ${event.row.appointmentType || 'Regular'}</p>
            </div>

            </div>
              <!-- Middle Part: Medical Details -->
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px 0; color: #f59e0b   ; font-size: 18px;">🏥 Medical Details</h3>
                <p><strong>Department:</strong> ${event.row.department || 'N/A'}</p>
                <p><strong>Doctor:</strong> ${event.row.doctorName || 'N/A'}</p>
                <p><strong>Specialization:</strong> ${event.row.specialization || 'N/A'}</p>
                <p><strong>Consultation Fee:</strong> ₹${event.row.consultationFee || '0'}</p>
              </div>

          `;
      
        this.dialog.open(ConfirmationDialog, {
          data: {
            title: 'Appointment Details',
            message: this.sanitizer.bypassSecurityTrustHtml(htmlContent)
            }
        });
        break;
    }
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  appointmentDetails(id: string) {
    this.router.navigate(['/admin/appointment-details', id]);
  }

  editAppointment(appointment: any) {
    // Simple approach - create form fields with basic data
    this.appointmentFields = [
      // { key: 'appointmentCode', label: 'Appointment ID', type: 'text', placeholder: 'Appointment ID', required: false, readonly: true, value: appointment.appointmentCode },
      { key: 'patientName', label: 'Patient Name', type: 'text', placeholder: 'Patient Name', required: false, readonly: true, value: appointment.patientName },
      { key: 'mobile', label: 'Patient Contact', type: 'text', placeholder: 'Contact Number', required: false, value: appointment.mobile },
      { key: 'doctorName', label: 'Doctor Name', type: 'text', placeholder: 'Doctor Name', required: true, value: appointment.doctorName },
      { key: 'department', label: 'Department', type: 'text', placeholder: 'Department', required: true, value: appointment.department },
      { key: 'appointmentDate', label: 'Date', type: 'date', placeholder: 'Select Date', required: true, value: appointment.appointmentDate },
      { key: 'timeSlot', label: 'Time Slot', type: 'text', placeholder: 'Time Slot', required: true, value: appointment.timeSlot },
      {
        key: 'status', label: 'Status', type: 'select', options: [
          { label: 'Scheduled', value: 'scheduled' },
          { label: 'Completed', value: 'completed' },
          { label: 'Cancelled', value: 'cancelled' },
          { label: 'Pending', value: 'pending' }
        ], required: true, value: appointment.status
      },
      { key: 'consultationFee', label: 'Consultation Fee', type: 'number', placeholder: 'Fee Amount', required: false, value: appointment.consultationFee },
      { key: 'email', label: 'Email', type: 'email', required: false, readonly: true, value: appointment.email }
    ];

    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '600px',
      data: {
        title: 'Edit Appointment',
        fields: this.appointmentFields,
        buttons: [{
          label: 'Update',
          color: 'primary',
          type: 'submit',
          icon: 'fa-solid fa-save',
          customClass: 'flex justify-end'

        }]
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const appointmentId = appointment.appointmentCode || appointment._id;
        this.appointmentService.updateAppointment(appointmentId, result).subscribe({
          next: (response: any) => {
            // BehaviorSubject will handle real-time update
          },
          error: (error: any) => {
            alert('Error updating appointment: ' + (error.error?.message || error.message));
          }
        });
      }
    });
  }

  deleteAppointment(appointment: any) {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '400px',
      data: {
        title: 'Delete Appointment',
        message: `Are you sure you want to delete appointment for ${appointment.patientName}?`,
        buttons: [
          {
            label: 'Cancel',
            color: 'secondary',
            type: 'button',
            icon: 'fa-solid fa-times'
          },
          {
            label: 'Delete',
            color: 'danger',
            type: 'submit',
            icon: 'fa-solid fa-trash'
          }
        ]
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const appointmentId = appointment.appointmentCode || appointment._id;
        this.appointmentService.deleteAppointment(appointmentId).subscribe({
          next: (response: any) => {
            // BehaviorSubject will handle real-time update
          },
          error: (error: any) => {
            alert('Error deleting appointment: ' + (error.error?.message || error.message));
          }
        });
      }
    });
  }

  updateAppointmentStatus(appointment: any, status: string, notes: string) {
    this.appointmentService.updateAppointmentStatus(appointment._id || appointment.appointmentCode, status, notes).subscribe();
  }

  generateInvoice(appointment: any) {
    const invoiceData = {
      appointmentCode: appointment.appointmentCode,
      patientName: appointment.patientName,
      doctorName: appointment.doctorName,
      department: appointment.department,
      date: appointment.appointmentDate,
      time: appointment.timeSlot,
      consultationFee: appointment.consultationFee || 500
    };

    this.dialog.open(ConfirmationDialog, {
      width: '500px',
      data: {
        title: 'Generate Invoice',
        message: `
        <div style="text-align: left; line-height: 1.6;">
          <h3 style="margin: 0 0 15px 0; color: #1e40af;">🧾 Invoice Details</h3>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
            <p><strong>Invoice Number:</strong> INV-${appointment.appointmentCode}</p>
            <p><strong>Patient:</strong> ${appointment.patientName}</p>
            <p><strong>Doctor:</strong> ${appointment.doctorName}</p>
            <p><strong>Department:</strong> ${appointment.department}</p>
            <p><strong>Date:</strong> ${appointment.appointmentDate}</p>
            <p><strong>Time:</strong> ${appointment.timeSlot}</p>
            <p><strong>Amount:</strong> <span style="color: #059669; font-size: 18px; font-weight: bold;">₹${appointment.consultationFee || 500}</span></p>
          </div>
        </div>
        `,
        confirmText: 'Generate PDF',
        cancelText: 'Cancel'
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        // Here you would implement actual PDF generation
      }
    });
  }

  loadDropdownOptions(callback: () => void) {
    // Load doctors
    this.doctorService.getAllDoctors().subscribe({
      next: (doctors) => {
        const doctorField = this.appointmentFields.find(field => field.key === 'doctorName');
        if (doctorField) {
          doctorField.options = doctors.map((doctor: any) => ({
            label: doctor.doctorName,
            value: doctor.doctorName
          }));
        }
      }
    });

    // Load departments
    this.departmentService.getAllDepartmentsFromBackend().subscribe({
      next: (departments) => {
        const departmentField = this.appointmentFields.find(field => field.key === 'department');
        if (departmentField) {
          departmentField.options = departments.map((dept: any) => ({
            label: dept.departmentName,
            value: dept.departmentName
          }));
        }
      }
    });

    // Load time slots (only if not already loaded)
    const timeSlotField = this.appointmentFields.find(field => field.key === 'timeSlot');
    if (timeSlotField && (!timeSlotField.options || timeSlotField.options.length === 0)) {
      timeSlotField.options = [
        { label: '09:00 AM - 09:30 AM', value: '09:00-09:30' },
        { label: '09:30 AM - 10:00 AM', value: '09:30-10:00' },
        { label: '10:00 AM - 10:30 AM', value: '10:00-10:30' },
        { label: '10:30 AM - 11:00 AM', value: '10:30-11:00' },
        { label: '11:00 AM - 11:30 AM', value: '11:00-11:30' },
        { label: '11:30 AM - 12:00 PM', value: '11:30-12:00' },
        { label: '02:00 PM - 02:30 PM', value: '14:00-14:30' },
        { label: '02:30 PM - 03:00 PM', value: '14:30-15:00' },
        { label: '03:00 PM - 03:30 PM', value: '15:00-15:30' },
        { label: '03:30 PM - 04:00 PM', value: '15:30-16:00' },
        { label: '04:00 PM - 04:30 PM', value: '16:00-16:30' },
        { label: '04:30 PM - 05:00 PM', value: '16:30-17:00' }
      ];
    }

    // Execute callback after loading options
    setTimeout(() => {
      callback();
    }, 500);
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return '#28a745';
      case 'inactive': return '#dc3545';
      case 'confirmed': return '#28a745';
      case 'cancelled': return '#dc3545';
      case 'completed': return '#17a2b8';
      case 'pending': return '#ffc107';
      case 'scheduled': return '#007bff';
      default: return '#6c757d';
    }
  }
}
