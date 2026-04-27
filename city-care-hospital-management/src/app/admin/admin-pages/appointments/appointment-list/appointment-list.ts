import { Component, OnInit, inject } from '@angular/core';
import { Table } from "../../../../shared/ui/table/table";
import { Heading } from "../../../../shared/ui/heading/heading";
import { Router, ActivatedRoute } from '@angular/router';
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
import { StatusHelper } from '../../../../core/utils';

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
    private route: ActivatedRoute,
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
          ? `${appointment.appointmentCode.substring(0, 6)}${appointment.appointmentCode.substring(14, 20)}`
          : ''
      }));

      // Apply filter from query params
      this.applyFilterFromQueryParams();
    });

    // Initial load
    this.appointmentService.getAllAppointments().subscribe();

    // Subscribe to query params changes
    this.route.queryParams.subscribe(params => {
      this.applyFilterFromQueryParams();
    });
  }

  applyFilterFromQueryParams() {
    const filter = this.route.snapshot.queryParams['filter'];

    if (!filter || filter === 'all') {
      this.filteredAppointmentData = [...this.appointmentData];
    } else if (filter === 'pending') {
      this.filteredAppointmentData = this.appointmentData.filter(apt =>
        apt.status?.toLowerCase() === 'pending'
      );
    } else if (filter === 'today') {
      const today = new Date();
      this.filteredAppointmentData = this.appointmentData.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate.toDateString() === today.toDateString();
      });
    }
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value.toLowerCase();
    this.filterAppointments();
    this.currentPage = 1; // Reset to first page on search
  }

  filterAppointments() {
    if (!this.searchTerm) {
      this.filteredAppointmentData = [...this.appointmentData];
      return;
    } else {
      this.filteredAppointmentData = this.appointmentData.filter(appointment =>
        appointment.patientName?.toLowerCase().includes(this.searchTerm) ||
        appointment.doctorName?.toLowerCase().includes(this.searchTerm) ||
        appointment.department?.toLowerCase().includes(this.searchTerm) ||
        appointment.appointmentCode?.toLowerCase().includes(this.searchTerm) ||
        (appointment as any).shortId?.toLowerCase().includes(this.searchTerm) ||
        appointment.status?.toLowerCase().includes(this.searchTerm)
      );
    }
  }
  clearSearch(): void {
    this.searchTerm = '';
    this.filteredAppointmentData = this.appointmentData;
    this.currentPage = 1;
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
        // View - Always available
        { label: '<i class="fa-solid fa-eye text-blue-500 mr-2"></i>View Details', action: 'view' },

        // Pending → Approve (Green) / Reject (Red)
        { label: '<i class="fa-solid fa-check text-green-500 mr-2"></i>Approve', action: 'confirm', show: (row: any) => row.status === 'pending' },
        { label: '<i class="fa-solid fa-xmark text-red-500 mr-2"></i>Reject', action: 'reject', show: (row: any) => row.status === 'pending' },

        // Confirmed → Cancel (Red) / Complete (Green)
        { label: '<i class="fa-solid fa-ban text-red-500 mr-2"></i>Cancel/Reject', action: 'cancel', show: (row: any) => row.status === 'confirmed' },
        { label: '<i class="fa-solid fa-check-double text-green-500 mr-2"></i>Mark Complete', action: 'complete', show: (row: any) => row.status === 'confirmed' },

        // Edit - Only for Pending/Confirmed (Blue)
        { label: '<i class="fa-solid fa-pen text-blue-500 mr-2"></i>Edit', action: 'edit', show: (row: any) => row.status === 'pending' || row.status === 'confirmed' },

        // Delete - Only for Cancelled/Completed (Red)
        { label: '<i class="fa-solid fa-trash text-red-500 mr-2"></i>Delete', action: 'delete', show: (row: any) => row.status === 'cancelled' || row.status === 'completed' }
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
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${event.row.appointmentCode || event.row.shortId || 'N/A'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Status</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: ${this.getStatusColor(event.row.status)}; font-size: 13px;">● ${event.row.status || 'N/A'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Patient Name</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${event.row.patientName || 'N/A'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Mobile</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${event.row.mobile || 'N/A'}</p>
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
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${event.row.appointmentDate ? new Date(event.row.appointmentDate).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Time Slot</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${event.row.timeSlot || 'N/A'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Duration</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${event.row.duration || '30 minutes'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Type</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${event.row.appointmentType || 'Regular'}</p>
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
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${event.row.department || 'N/A'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Doctor</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${event.row.doctorName || 'N/A'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Specialization</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${event.row.specialization || 'N/A'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Consultation Fee</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #10b981; font-size: 13px;">₹${event.row.consultationFee || '0'}</p>
            </div>
          </div>
        </div>
      `;

        this.dialog.open(ConfirmationDialog, {
          width: '650px',
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
      width: '650px',
      data: {
        title: 'Invoice Details',
        message: `
        <div style="font-family: Arial, sans-serif; text-align: left; line-height: 1.5;">
          <!-- Invoice Header -->
          <div style="background: #005EB8; color: white; padding: 12px; border-radius: 10px; text-align: center; margin-bottom: 12px;">
            <div style="font-size: 20px; margin-bottom: 4px;">🏥</div>
            <h2 style="margin: 0; font-size: 16px; font-weight: bold;">City Care Hospital</h2>
            <p style="margin: 2px 0 0 0; font-size: 11px; opacity: 0.9;">Invoice for Medical Consultation</p>
          </div>
          
          <!-- Invoice Number and Date -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 2px solid #005EB8; padding-bottom: 10px;">
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Invoice Number</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #005EB8; font-size: 14px;">INV-${appointment.appointmentCode}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; font-size: 11px; color: #666;">Date</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 14px;">${new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </div>
          
          <!-- Patient Information -->
          <div style="background: white; padding: 12px; border-radius: 10px; margin-bottom: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h4 style="color: #005EB8; margin: 0 0 10px 0; font-size: 14px; display: flex; align-items: center; gap: 6px;">
              <span>👤</span> Patient Information
            </h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <p style="margin: 0; font-size: 11px; color: #666;">Name</p>
                <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${appointment.patientName}</p>
              </div>
              <div>
                <p style="margin: 0; font-size: 11px; color: #666;">Email</p>
                <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${appointment.email || 'N/A'}</p>
              </div>
              <div>
                <p style="margin: 0; font-size: 11px; color: #666;">Mobile</p>
                <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${appointment.mobile || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          <!-- Appointment Details -->
          <div style="background: white; padding: 12px; border-radius: 10px; margin-bottom: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h4 style="color: #005EB8; margin: 0 0 10px 0; font-size: 14px; display: flex; align-items: center; gap: 6px;">
              <span>📅</span> Appointment Details
            </h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <p style="margin: 0; font-size: 11px; color: #666;">Appointment ID</p>
                <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${appointment.appointmentCode}</p>
              </div>
              <div>
                <p style="margin: 0; font-size: 11px; color: #666;">Department</p>
                <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${appointment.department}</p>
              </div>
              <div>
                <p style="margin: 0; font-size: 11px; color: #666;">Doctor</p>
                <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">Dr. ${appointment.doctorName}</p>
              </div>
              <div>
                <p style="margin: 0; font-size: 11px; color: #666;">Date & Time</p>
                <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${appointment.appointmentDate} ${appointment.timeSlot}</p>
              </div>
            </div>
          </div>
          
          <!-- Payment Details -->
          <div style="background: white; padding: 12px; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h4 style="color: #005EB8; margin: 0 0 10px 0; font-size: 14px; display: flex; align-items: center; gap: 6px;">
              <span>💰</span> Payment Details
            </h4>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e5e7eb; padding-top: 10px;">
              <div>
                <p style="margin: 0; font-size: 13px; color: #333;">Medical Consultation Fee</p>
              </div>
              <div>
                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #10b981;">₹${appointment.consultationFee || 500}</p>
              </div>
            </div>
          </div>
        </div>
        `,
        buttons: [
          {
            label: 'Download PDF',
            color: 'primary',
            type: 'submit',
            icon: 'fa-solid fa-download'
          },
          {
            label: 'Close',
            color: 'secondary',
            type: 'button'
          }
        ]
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        // PDF generation to be implemented
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
    return StatusHelper.getStatusColor(status);
  }
}
