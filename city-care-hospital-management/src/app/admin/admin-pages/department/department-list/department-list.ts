import { Component, inject, OnInit } from '@angular/core';
import { Heading } from "../../../../shared/ui/heading/heading";
import { Button } from "../../../../shared/ui/button/button";
import { Table } from "../../../../shared/ui/table/table";
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DynamicFormInterface } from '../../../../shared/ui/interfaces/dynamic-form-interface';
import { ButtonInterface } from '../../../../shared/ui/interfaces/button-interface';
import { DEPARTMENT_FORM_FIELDS, validateDepartmentForm } from '../../../../core/config/department-form-fields.config';
import { ConfirmationDialog } from '../../../../shared/components/confirmation-dialog/confirmation-dialog';
import { DepartmentService } from '../../../../core/services/department-service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-department-list',
  imports: [Heading, Button, Table],
  templateUrl: './department-list.html',
  styleUrls: ['./department-list.css'],
})
export class DepartmentList implements OnInit {

  constructor(
    private departmentService: DepartmentService,
    private dialog: MatDialog,
    private router: Router,
    private sanitizer: DomSanitizer
  ) { }

  // Helper method to refresh departments list
  private refreshDepartmentsList() {
    this.departmentService.getAllDepartmentsFromBackend().subscribe({
      next: (departments) => {
        this.departmentData = departments;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
      }
    });
  }

  departmentFields: DynamicFormInterface[] = [];
  currentPage: number = 1;

  departmentColumns = [
    { key: 'departmentId', label: 'Department ID' },
    { key: 'departmentName', label: 'Department Name' },
    { key: 'headOfDepartment', label: 'Head of Department' },
    { key: 'status', label: 'Status' }
  ];

  departmentActions = [
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

  buttons: ButtonInterface[] = [
    {
      label: 'Save',
      color: 'primary',
      type: 'submit',
      icon: 'fa-solid fa-plus',
      customClass: 'flex justify-end'
    }
  ];

  departmentData: any[] = [];

  handleTableAction(event: { action: string, row: any }) {
    switch (event.action) {
      case 'view':
      const htmlContent = `
            <div style="text-align: left; line-height: 1.6; display: flex;  gap: 15px;">
            
              <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px 0; color: #2563eb; font-size: 18px;">📋 Basic Information</h3>
                <p><strong>Department ID:</strong> ${event.row.departmentId || 'N/A'}</p>
                <p><strong>Department Name:</strong> ${event.row.departmentName || 'N/A'}</p>
                <p><strong>Head of Department:</strong> ${event.row.headOfDepartment || 'N/A'}</p>
                <p><strong>Number of Doctors:</strong> ${event.row.numberOfDoctors}</p>
                <p><strong>Status:</strong> <span style="color: ${this.getStatusColor(event.row.status)}; font-weight: bold;">● ${event.row.status || 'N/A'}</span></p>
              </div>
              
              <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px 0; color: #2563eb; font-size: 18px;">🌐 Details</h3>
                <p><strong>Subtitle:</strong> ${event.row.subtitle || 'N/A'}</p>
                <p><strong>Description:</strong></p>
                <div style="background: #fff; padding: 10px; border-radius: 4px; max-height: 150px; overflow-y: auto;">
                  ${event.row.description || 'N/A'}
                </div>

      <p><strong>Treatments:</strong></p>
                <div style="background: #fff; padding: 10px; border-radius: 4px; margin-top: 5px;">
                  ${event.row.treatments && event.row.treatments.length > 0 ?
                event.row.treatments.map((treatment: string, index: number) =>
                  `<span style="display: inline-block; background: #3b82f6; color: white; padding: 4px 8px; margin: 2px; border-radius: 4px; font-size: 12px;">${index + 1}</span> ${treatment}`
                ).join('') :
                '<span style="color: #666;">No treatments added</span>'
              }
                </div>                
                <p><strong>Linked Doctor IDs:</strong> ${event.row.doctorIds && event.row.doctorIds.length > 0 ? event.row.doctorIds.join(', ') : 'No doctors linked'}</p>

              </div>
              </div>
            `;

        this.dialog.open(ConfirmationDialog, {
          width: '700px',
          data: {
            title: 'Department Details',
            message: this.sanitizer.bypassSecurityTrustHtml(htmlContent)
            
            
            // `
            // <div style="text-align: left; line-height: 1.6;">
            //   <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            //     <h3 style="margin: 0 0 10px 0; color: #2563eb; font-size: 18px;">📋 Basic Information</h3>
            //     <p><strong>Department ID:</strong> ${event.row.departmentId || 'N/A'}</p>
            //     <p><strong>Department Name:</strong> ${event.row.departmentName || 'N/A'}</p>
            //     <p><strong>Head of Department:</strong> ${event.row.headOfDepartment || 'N/A'}</p>
            //     <p><strong>Status:</strong> <span style="color: ${this.getStatusColor(event.row.status)}; font-weight: bold;">● ${event.row.status || 'N/A'}</span></p>
            //   </div>
              
            //   <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            //     <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 18px;">🌐 Details</h3>
            //     <p><strong>Subtitle:</strong> ${event.row.subtitle || 'N/A'}</p>
            //     <p><strong>Number of Doctors:</strong> ${event.row.numberOfDoctors}</p>
            //     <p><strong>Description:</strong></p>
            //     <div style="background: #f1f3f4; padding: 10px; border-radius: 4px; max-height: 150px; overflow-y: auto;">
            //       ${event.row.description || 'N/A'}
            //     </div>
            //   </div>
              
            //   <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            //     <h3 style="margin: 0 0 10px 0; color: #f59e0b; font-size: 18px;">⚕ Medical Information</h3>
            //     <p><strong>Treatments:</strong></p>
            //     <div style="background: #fff; padding: 10px; border-radius: 4px; margin-top: 5px;">
            //       ${event.row.treatments && event.row.treatments.length > 0 ?
            //     event.row.treatments.map((treatment: string, index: number) =>
            //       `<span style="display: inline-block; background: #3b82f6; color: white; padding: 4px 8px; margin: 2px; border-radius: 4px; font-size: 12px;">${index + 1}</span> ${treatment}`
            //     ).join('') :
            //     '<span style="color: #666;">No treatments added</span>'
            //   }
            //     </div>
                
            //     <p><strong>Linked Doctor IDs:</strong> ${event.row.doctorIds && event.row.doctorIds.length > 0 ? event.row.doctorIds.join(', ') : 'No doctors linked'}</p>
            //     <p><strong>Number of Doctors:</strong> ${event.row.numberOfDoctors || '0'}</p>
            //   </div>
            // </div>
            // `
          }
        });
        break;
      case 'edit':
        this.editDepartment(event.row);
        break;
      case 'delete':
        this.deleteDepartment(event.row);
        break;
    }
  }

  deleteDepartment(department: any) {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '400px',
      data: {
        title: 'Delete Department',
        message: `Are you sure you want to delete ${department.departmentName}?`,
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
        const departmentId = department.departmentId || department._id;
        this.departmentService.deleteDepartment(departmentId).subscribe({
          next: (response: any) => {
            console.log('Department deleted successfully:', response);
            this.refreshDepartmentsList(); // Refresh list
          },
          error: (error: any) => {
            console.error('Error deleting department:', error);
            alert('Error deleting department: ' + (error.error?.message || error.message));
          }
        });
      }
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments() {
    this.departmentService.getAllDepartmentsFromBackend().subscribe({
      next: (departments) => {
        this.departmentData = departments;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
      }
    });
  }

  addDepartment() {
    this.departmentFields = structuredClone(DEPARTMENT_FORM_FIELDS);

    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '90%',
      maxWidth: '700px',
      data: {
        title: 'Add Department',
        fields: this.departmentFields,
        buttons: this.buttons,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Validate form before submission
        const validation = validateDepartmentForm(result, this.departmentData);

        if (!validation.isValid) {
          alert(validation.errors.join('\n'));
          return;
        }

        console.log('Department data:', result);
        this.departmentService.addDepartment(result).subscribe({
          next: (response) => {
            console.log('Department added successfully:', response);
            // Refresh departments list
            this.refreshDepartmentsList();
          },
          error: (error) => {
            console.error('Error adding department:', error);
            if (error.status === 400) {
              if (error.error?.message?.includes('already exists')) {
                alert('Department with this name already exists!');
              } else {
                alert('Error adding department: ' + (error.error?.message || error.message));
              }
            }
          }
        });
      }
    });
  }

  editDepartment(department: any) {
    // Try to find the department in current data first
    const currentDepartment = this.departmentData.find(dept =>
      dept.departmentId === department.departmentId ||
      dept._id === department.departmentId
    );

    if (!currentDepartment) {
      console.error('Department not found in current data. Available IDs:',
        this.departmentData.map(d => d.departmentId || d._id));
      alert('Department not found in current data. Please refresh and try again.');
      return;
    }

    // Use existing DEPARTMENT_FORM_FIELDS and pre-fill with current data
    this.departmentFields = structuredClone(DEPARTMENT_FORM_FIELDS);

    // Pre-fill all fields with current department data
    this.departmentFields.forEach(field => {
      if (currentDepartment[field.key] !== undefined) {
        // Handle array fields for display
        if (field.key === 'treatments' && Array.isArray(currentDepartment[field.key])) {
          field.value = currentDepartment[field.key].join(', ');
        } else if (field.key === 'faqs' && Array.isArray(currentDepartment[field.key])) {
          field.value = currentDepartment[field.key].map((faq: any) => `${faq.q}?${faq.a}`).join('||');
        } else if (field.key === 'doctorIds' && Array.isArray(currentDepartment[field.key])) {
          field.value = currentDepartment[field.key].join(', ');
        } else {
          field.value = currentDepartment[field.key];
        }
      }
    });


    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '600px',
      data: {
        title: 'Edit Department',
        fields: this.departmentFields,
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
        const updateId = currentDepartment.departmentId || currentDepartment._id;

        this.departmentService.updateDepartment(updateId, result).subscribe({
          next: (response: any) => {
            console.log('Department updated successfully:', response);

            // Refresh departments list
            this.refreshDepartmentsList();
          },
          error: (error: any) => {
            console.error('Error updating department:', error);
            console.error('Error status:', error.status);
            console.error('Error message:', error.message);
            console.error('Error details:', error.error);

            if (error.status === 400) {
              if (error.error?.message?.includes('already exists')) {
                alert('Department with this name already exists!');
              } else {
                alert('Error updating department: ' + (error.error?.message || error.message));
              }
            } else if (error.status === 500) {
              alert('Server error: ' + (error.error?.message || error.message));
            } else {
              alert('Error updating department: ' + (error.error?.message || error.message));
            }
          }
        });
      } else {
        console.log('Form cancelled or closed');
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


