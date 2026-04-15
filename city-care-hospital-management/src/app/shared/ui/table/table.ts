import { Component, EventEmitter, Input, Output, Renderer2, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableColumnInterface } from '../interfaces/table/table-column-interface';
import { TableRow } from '../interfaces/table/table-row.type';

@Component({
  selector: 'app-table',
  imports: [CommonModule],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class Table implements OnInit {

constructor(private renderer: Renderer2) {}

  // Table Heading
  @Input() columns: TableColumnInterface[] = [];

  // Table Data
  @Input() data: TableRow[] = [];

  // Pagination
  @Input() pageSize: number = 10;
  @Input() currentPage: number = 1;
  @Input() showPagination: boolean = false;

  // Show action column or not
  @Input() showActions: boolean = false;

  @Output() editRow = new EventEmitter<any>();
  @Output() removeRow = new EventEmitter<any>();
  @Output() pageChange = new EventEmitter<number>();

  @Input() actions : {
    label: string;
    action: string;
    show?: (row: any) => boolean;
    menuItems?: {
      label: string;
      action: string;
      show?: (row: any) => boolean;
    }[];
  }[] = [];

  @Output() actionClick = new EventEmitter<{action: string, row: any}>();

  dropdownRow: any = null;

  ngOnInit(): void {
  this.renderer.listen('document', 'click', (event) => {
    if (!event.target.closest('app-table')) {
      this.dropdownRow = null;
    }
  });    
  }

  onMouseLeaveDropdown() {
    this.dropdownRow = null;
  }

  get paginatedData() {
    if (!this.showPagination) {
      return this.data;
    }
    
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.data.slice(startIndex, endIndex);
  }

  get totalPages() {
    return Math.ceil(this.data.length / this.pageSize);
  }

  get pages() {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  toggleDropdown(row: any) {
    this.dropdownRow = this.dropdownRow === row ? null : row;
  }

  handleAction(action: string, row: any) {
    this.actionClick.emit({ action, row });
    this.dropdownRow = null; // Close dropdown after action
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.pageChange.emit(page);
  }

  onPreviousPage() {
    if (this.currentPage > 1) {
      this.onPageChange(this.currentPage - 1);
    }
  }

  onNextPage() {
    if (this.currentPage < this.totalPages) {
      this.onPageChange(this.currentPage + 1);
    }
  }

  // Method to get unique tracking identifier for rows
  getTrackBy(row: any) {
    // Try to find a unique identifier in order of preference
    return row._id || row.id || row.doctorId || row.departmentId || row.appointmentCode || JSON.stringify(row);
  }
}
