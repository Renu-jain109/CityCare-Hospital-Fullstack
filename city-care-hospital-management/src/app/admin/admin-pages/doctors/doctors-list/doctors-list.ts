import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Button } from "../../../../shared/ui/button/button";
import { Table } from "../../../../shared/ui/table/table";
import { DoctorInterface } from '../../../../core/interfaces/doctor-interface';
import { TableColumnInterface } from '../../../../shared/ui/interfaces/table/table-column-interface';
import { DoctorService } from '../../../../core/services/doctor-service';
import { MatDialog } from '@angular/material/dialog';
import { DynamicFormInterface } from '../../../../shared/ui/interfaces/dynamic-form-interface';
import { ButtonInterface } from '../../../../shared/ui/interfaces/button-interface';
import { DepartmentService } from '../../../../core/services/department-service';
import { DOCTOR_FORM_FIELDS } from '../../../../core/config/doctor-form-fields.config';
import { ConfirmationDialog } from '../../../../shared/components/confirmation-dialog/confirmation-dialog';
import { Heading } from '../../../../shared/ui/heading/heading';
import { DomSanitizer } from '@angular/platform-browser';
  
@Component({
  selector: 'app-doctors-list',
  imports: [Button, Table, Heading],
  templateUrl: './doctors-list.html',
  styleUrl: './doctors-list.css',
})
export class DoctorsList implements OnInit {
  router = inject(Router);
  doctorService = inject(DoctorService);
  dialog = inject(MatDialog);
  doctorFields: DynamicFormInterface[] = [];
  departmentService = inject(DepartmentService);
  currentPage: number = 1;
  constructor(private sanitizer: DomSanitizer) {}

  doctorColumns: TableColumnInterface[] = [
    { key: 'doctorId', label: 'Doctor ID' },
    { key: 'doctorName', label: 'Doctor Name' },
    { key: 'departmentName', label: 'Department' },
    { key: 'availability', label: 'Availability' },
    { key: 'status', label: 'Status' },

  ];

  buttons: ButtonInterface[] = [
    {
      label: 'Save',
      color: 'primary',
      type: 'submit',
      icon: 'fa-solid fa-plus',
      customClass: 'flex justify-end'
    }
  ];



  doctorData: DoctorInterface[] = [];
  doctorActions = [
    {
      label: '<i class="fa-solid fa-ellipsis"></i>',
      action: 'menu',
      show: (row: any) => true,
      menuItems: [
        { label: 'View Details', action: 'view' },
        { label: 'Edit', action: 'edit' },
        { label: 'Delete', action: 'delete' }
      ]
    }
  ];

  ngOnInit(): void {
    // Load departments for form options
    this.departmentService.getAllDepartmentsFromBackend().subscribe({
      next: (departments) => {
        console.log('Departments loaded:', departments);
      },
      error: (error) => {
        console.error('Error loading departments:', error);
      }
    });

    // Load doctors
    this.doctorService.getAllDoctors().subscribe((doctors) => {
      this.doctorData = doctors;
    });
  }

  handleTableAction(event: { action: string, row: any }) {
    switch (event.action) {
      case 'view':
      const htmlContent = `
            <div style="text-align: left; line-height: 1.6; display: flex; gap: 10px;">

             <!-- Left Part: Basic Information -->
              <div style="flex: 1; background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px 0; color: #2563eb; font-size: 18px;">👨‍⚕️ Basic Information</h3>
                <p><strong>Doctor ID:</strong> ${event.row.doctorId || 'N/A'}</p>
                <p><strong>Doctor Name:</strong> ${event.row.doctorName || 'N/A'}</p>
                <p><strong>Department:</strong> ${event.row.departmentName || 'N/A'}</p>
                <p><strong>Email:</strong> ${event.row.email || 'N/A'}</p>
                <p><strong>Mobile:</strong> ${event.row.mobile || 'N/A'}</p>
                <p><strong>Status:</strong> <span style="color: ${this.getStatusColor(event.row.status)}; font-weight: bold;">● ${event.row.status || 'N/A'}</span></p>
              </div>
              
              <!-- Right Part: Professional Information -->
              <div style="flex: 1; background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px 0; color: #2563eb; font-size: 18px;">🩺 Professional Information</h3>
                <p><strong>Specialization:</strong> ${event.row.specialization || 'N/A'}</p>
                <p><strong>Experience:</strong> ${event.row.experience || 'N/A'} years</p>
                <p><strong>Qualification:</strong> ${event.row.qualification || 'N/A'}</p>
                <p><strong>Consultation Fee:</strong> ₹${event.row.consultationFee || '0'}</p>
                <p><strong>Availability:</strong> ${event.row.availability || 'N/A'}</p>
              </div>
            </div>
          `;

        this.dialog.open(ConfirmationDialog, {
          data: {
            title: 'Doctor Details',
            message: this.sanitizer.bypassSecurityTrustHtml(htmlContent)
          }
        });
        break;
      case 'edit':
        this.editDoctor(event.row);
        break;
      case 'delete':
        this.deleteDoctor(event.row);
        break;
    }
  }

  deleteDoctor(doctor: any) {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '400px',
      data: {
        title: 'Delete Doctor',
        message: `Are you sure you want to delete ${doctor.doctorName}?`,
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
        const doctorId = doctor.doctorId || doctor._id;
        this.doctorService.deleteDoctor(doctorId).subscribe({
          next: (response: any) => {
            console.log('Doctor deleted successfully:', response);
            // Refresh doctors list
            this.doctorService.getAllDoctors().subscribe((doctors) => {
              this.doctorData = doctors;
            });
          },
          error: (error: any) => {
            console.error('Error deleting doctor:', error);
            alert('Error deleting doctor: ' + (error.error?.message || error.message));
          }
        });
      }
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  addDoctors() {
    this.doctorFields = structuredClone(DOCTOR_FORM_FIELDS);

    // Load departments first, then open dialog
    this.departmentService.getAllDepartmentsFromBackend().subscribe({
      next: (departments) => {
        const departmentField = this.doctorFields.find(field => field.key === 'departmentName');
        if (departmentField) {
          departmentField.options = departments.map((dept: any) => ({
            label: dept.departmentName || dept,
            value: dept.departmentName || dept
          }));
        }
        
        // Now open the dialog with populated departments
        const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '90%',
      maxWidth: '700px',
      maxHeight: '80vh',
          data: {
            title: 'Add Doctor',
            fields: this.doctorFields,
            buttons: this.buttons
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            console.log('Doctor data:', result);
            this.doctorService.addDoctor(result).subscribe({
              next: (response: any) => {
                console.log('Doctor added successfully:', response);
                // Refresh the doctors list
                this.doctorService.getAllDoctors().subscribe((doctors) => {
                  this.doctorData = doctors;
                });
              },
              error: (error: any) => {
                console.error('Error adding doctor:', error);
              }
            });
          }
        });
      },
      error: (error: any) => {
        console.error('Error loading departments for form:', error);
        // Still open dialog even if departments fail to load
        const dialogRef = this.dialog.open(ConfirmationDialog, {
          width: '600px',
          data: {
            title: 'Add Doctor',
            fields: this.doctorFields,
            buttons: this.buttons
          }
        });
      }
    });
  }

  editDoctor(doctor: any) {
    // Use existing DOCTOR_FORM_FIELDS and pre-fill with current data
    this.doctorFields = structuredClone(DOCTOR_FORM_FIELDS);
    
    // Pre-fill all fields with current doctor data
    this.doctorFields.forEach(field => {
      if (doctor[field.key] !== undefined) {
        field.value = doctor[field.key];
      }
    });
    
    // Update department options dynamically
    const departmentField = this.doctorFields.find(field => field.key === 'departmentName');
    if (departmentField) {
      this.departmentService.getAllDepartmentsFromBackend().subscribe({
        next: (departments) => {
          departmentField.options = departments.map((dept: any) => ({ 
            label: dept.departmentName || dept, 
            value: dept.departmentName || dept 
          }));
        },
        error: (error: any) => {
          console.error('Error loading departments:', error);
        }
      });
    }

    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '700px',
      data: {
        title: 'Edit Doctor',
        fields: this.doctorFields,
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
        console.log('Updated doctor data:', result);
        this.doctorService.updateDoctor(doctor.doctorId, result).subscribe({
          next: (response: any) => {
            console.log('Doctor updated successfully:', response);
            // Refresh the doctors list
            this.doctorService.getAllDoctors().subscribe((doctors) => {
              this.doctorData = doctors;
            });
          },
          error: (error: any) => {
            console.error('Error updating doctor:', error);
            alert('Error updating doctor: ' + (error.error?.message || error.message));
          }
        });
      }
    });
  }

  private getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return '#28a745';
      case 'inactive': return '#dc3545';
      case 'confirmed': return '#28a745';
      case 'cancelled': return '#dc3545';
      case 'completed': return '#17a2b8';
      case 'pending': return '#ffc107';
      default: return '#6c757d';
    }
  }


}


