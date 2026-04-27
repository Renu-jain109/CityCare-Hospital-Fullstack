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
import { StatusHelper, SearchFilterHelper } from '../../../../core/utils';

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
        this.filterDepartments(); // Re-apply search filter
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
    { key: 'numberOfDoctors', label: 'Doctors' },
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
  filteredDepartmentData: any[] = [];
  searchTerm: string = '';

  handleTableAction(event: { action: string, row: any }) {
    switch (event.action) {
      case 'view':
      const htmlContent = `
        <!-- Hospital Banner -->
        <div style="background: #005EB8; padding: 12px; border-radius: 10px; text-align: center; color: white; margin-bottom: 12px;">
          <div style="font-size: 20px; margin-bottom: 4px;">🏥</div>
          <h3 style="margin: 0; font-size: 16px; font-weight: bold;">City Care Hospital</h3>
          <p style="margin: 2px 0 0 0; font-size: 12px; opacity: 0.9;">Department Profile</p>
        </div>

        <!-- Basic Information Card -->
        <div style="background: white; padding: 12px; border-radius: 10px; margin-bottom: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h4 style="color: #005EB8; margin: 0 0 10px 0; font-size: 14px; display: flex; align-items: center; gap: 6px;">
            <span>📋</span> Basic Information
          </h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Department ID</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${event.row.departmentId || 'N/A'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Department Name</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${event.row.departmentName || 'N/A'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Head of Department</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${event.row.headOfDepartment || 'N/A'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Status</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: ${this.getStatusColor(event.row.status)}; font-size: 13px;">● ${event.row.status || 'N/A'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Number of Doctors</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${event.row.numberOfDoctors || '0'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Linked Doctors</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${event.row.doctorIds && event.row.doctorIds.length > 0 ? event.row.doctorIds.length + ' doctors' : 'None'}</p>
            </div>
          </div>
        </div>

        <!-- Additional Details Card -->
        <div style="background: white; padding: 12px; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h4 style="color: #005EB8; margin: 0 0 10px 0; font-size: 14px; display: flex; align-items: center; gap: 6px;">
            <span>🌐</span> Additional Details
          </h4>
          <div>
            <div style="margin-bottom: 8px;">
              <p style="margin: 0; font-size: 11px; color: #666;">Subtitle</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${event.row.subtitle || 'N/A'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Description</p>
              <p style="margin: 2px 0 0 0; font-weight: 500; color: #555; font-size: 13px; line-height: 1.4;">${event.row.description || 'No description available'}</p>
            </div>
          </div>
        </div>
      `;

        this.dialog.open(ConfirmationDialog, {
          data: {
            title: 'Department Details',
            message: this.sanitizer.bypassSecurityTrustHtml(htmlContent)
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
            this.refreshDepartmentsList(); // Refresh list
            this.filterDepartments(); // Re-apply search filter
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
        this.filteredDepartmentData = departments;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
      }
    });
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value.toLowerCase();
    this.filterDepartments();
    this.currentPage = 1; // Reset to first page on search
  }

  filterDepartments(): void {
    if (!this.searchTerm) {
      this.filteredDepartmentData = this.departmentData;
    } else {
      this.filteredDepartmentData = this.departmentData.filter(dept =>
        dept.departmentName?.toLowerCase().includes(this.searchTerm) ||
        dept.departmentId?.toLowerCase().includes(this.searchTerm) ||
        dept.headOfDepartment?.toLowerCase().includes(this.searchTerm) ||
        dept.status?.toLowerCase().includes(this.searchTerm)
      );
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredDepartmentData = this.departmentData;
    this.currentPage = 1;
  }

  addDepartment() {
    this.departmentFields = structuredClone(DEPARTMENT_FORM_FIELDS);

    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '650px',
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

        this.departmentService.addDepartment(result).subscribe({
          next: (response: any) => {
            this.refreshDepartmentsList();
            this.clearSearch(); // Clear search to show new department
          },
          error: (error: any) => {
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
      width: '650px',
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
            // Refresh departments list
            this.refreshDepartmentsList();
            this.filterDepartments();
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
      }
    });
  }

  private getStatusColor(status: string): string {
    return StatusHelper.getStatusColor(status);
  }

}


