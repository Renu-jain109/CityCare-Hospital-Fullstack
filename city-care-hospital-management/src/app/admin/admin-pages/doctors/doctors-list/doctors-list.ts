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
import { StatusHelper, SearchFilterHelper } from '../../../../core/utils';
  
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
  filteredDoctorData: DoctorInterface[] = [];
  searchTerm: string = '';
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
      next: (departments) => {},
      error: (error) => {
        console.error('Error loading departments:', error);
      }
    });

    // Load doctors
    this.doctorService.getAllDoctors().subscribe((doctors) => {
      this.doctorData = doctors;
      this.filteredDoctorData = doctors;
    });
  }

  handleTableAction(event: { action: string, row: any }) {
    switch (event.action) {
      case 'view':
      const htmlContent = `
        <!-- Hospital Banner -->
        <div style="background: #005EB8; padding: 12px; border-radius: 10px; text-align: center; color: white; margin-bottom: 12px;">
          <div style="font-size: 20px; margin-bottom: 4px;">🏥</div>
          <h3 style="margin: 0; font-size: 16px; font-weight: bold;">City Care Hospital</h3>
          <p style="margin: 2px 0 0 0; font-size: 12px; opacity: 0.9;">Doctor Profile</p>
        </div>

        <!-- Basic Information Card -->
        <div style="background: white; padding: 12px; border-radius: 10px; margin-bottom: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h4 style="color: #005EB8; margin: 0 0 10px 0; font-size: 14px; display: flex; align-items: center; gap: 6px;">
            <span>👤</span> Basic Information
          </h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Doctor ID</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${event.row.doctorId || 'N/A'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Name</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${event.row.doctorName || 'N/A'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Department</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${event.row.departmentName || 'N/A'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Status</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: ${this.getStatusColor(event.row.status)}; font-size: 13px;">● ${event.row.status || 'N/A'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Email</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${event.row.email || 'N/A'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Mobile</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${event.row.mobile || 'N/A'}</p>
            </div>
          </div>
        </div>

        <!-- Professional Information Card -->
        <div style="background: white; padding: 12px; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h4 style="color: #005EB8; margin: 0 0 10px 0; font-size: 14px; display: flex; align-items: center; gap: 6px;">
            <span>🩺</span> Professional Information
          </h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Specialization</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${event.row.specialization || 'N/A'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Experience</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${event.row.experience || '0'} years</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Qualification</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${event.row.qualification || 'N/A'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Consultation Fee</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">₹${event.row.consultationFee || '0'}</p>
            </div>
          </div>
          <div style="margin-top: 8px;">
            <p style="margin: 0; font-size: 11px; color: #666;">Availability</p>
            <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${event.row.availability || 'N/A'}</p>
          </div>
        </div>
      `;

        this.dialog.open(ConfirmationDialog, {
          width: '650px',
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
            // Refresh doctors list
            this.doctorService.getAllDoctors().subscribe((doctors) => {
              this.doctorData = doctors;
              this.filterDoctors(); // Re-apply search filter
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

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value.toLowerCase();
    this.filterDoctors();
    this.currentPage = 1; // Reset to first page on search
  }

  filterDoctors(): void {
    this.filteredDoctorData = SearchFilterHelper.filterDoctors(this.doctorData, this.searchTerm);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredDoctorData = this.doctorData;
    this.currentPage = 1;
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
            value: dept.departmentName || dept,
            departmentId: dept.departmentId
          }));
        }

        // Now open the dialog with populated departments
        const dialogRef = this.dialog.open(ConfirmationDialog, {
          width: '650px',
          data: {
            title: 'Add Doctor',
            fields: this.doctorFields,
            buttons: this.buttons,
            onDepartmentChange: (deptName: string) => {
              const selectedDept = departments.find((d: any) => d.departmentName === deptName);
              if (selectedDept) {
                return { departmentId: selectedDept.departmentId };
              }
              return {};
            }
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.doctorService.addDoctor(result).subscribe({
              next: (response: any) => {
                // Refresh the doctors list
                this.doctorService.getAllDoctors().subscribe((doctors) => {
                  this.doctorData = doctors;
                  this.filterDoctors(); // Re-apply search filter
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
          width: '650px',
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
    let departments: any[] = [];
    const departmentField = this.doctorFields.find(field => field.key === 'departmentName');
    if (departmentField) {
      this.departmentService.getAllDepartmentsFromBackend().subscribe({
        next: (depts) => {
          departments = depts;
          departmentField.options = depts.map((dept: any) => ({
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
      width: '650px',
      data: {
        title: 'Edit Doctor',
        fields: this.doctorFields,
        buttons: [{
          label: 'Update',
          color: 'primary',
          type: 'submit',
          icon: 'fa-solid fa-save',
          customClass: 'flex justify-end'
        }],
        onDepartmentChange: (deptName: string) => {
          const selectedDept = departments.find((d: any) => d.departmentName === deptName);
          if (selectedDept) {
            return { departmentId: selectedDept.departmentId };
          }
          return {};
        }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.doctorService.updateDoctor(doctor.doctorId, result).subscribe({
          next: (response: any) => {
            // Refresh the doctors list
            this.doctorService.getAllDoctors().subscribe((doctors) => {
              this.doctorData = doctors;
              this.filterDoctors(); // Re-apply search filter
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
    return StatusHelper.getStatusColor(status);
  }


}


