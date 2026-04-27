import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Heading } from "../../../shared/ui/heading/heading";
import { SpecialitiesCard } from '../../../shared/sections/specialities-card/specialities-card';
import { FilterBar, FilterOption, FilterValues } from '../../../shared/ui/filter-bar/filter-bar';
import { DepartmentService } from '../../../core/services/department-service';
import { DepartmentInterface } from '../../../core/interfaces/department-interface';


@Component({
  selector: 'app-department',
  imports: [CommonModule, SpecialitiesCard, Heading, FilterBar],
  templateUrl: './department.html',
  styleUrl: './department.css',
})
export class Department implements OnInit {
  departmentName = '';
  departmentDescription = '';
  doctors: any[] = [];

  constructor(private route: ActivatedRoute, private router: Router) { }
  departmentService = inject(DepartmentService)

  departments: DepartmentInterface[] = [];
  filteredDepartments: DepartmentInterface[] = [];

  // Filter values
  searchQuery: string = '';
  sortValue: string = '';

  // Sort options
  sortOptions: FilterOption[] = [
    { label: 'Sort by', value: '' },
    { label: 'Name (A-Z)', value: 'name_asc' },
    { label: 'Name (Z-A)', value: 'name_desc' }
  ];

  ngOnInit() {
    // Load only Active departments for public UI
    this.departmentService.getActiveDepartments().subscribe((data) => {
      this.departments = data;
      this.filteredDepartments = [...data];
    });
  }

  onSearchChange(search: string) {
    this.searchQuery = search.toLowerCase();
    this.applyFilters();
  }

  onSortChange(sort: string) {
    this.sortValue = sort;
    this.applyFilters();
  }

  onFiltersChange(filters: FilterValues) {
    this.searchQuery = filters.search.toLowerCase();
    this.sortValue = filters.sort;
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.departments];

    // Search filter
    if (this.searchQuery) {
      result = result.filter(dept =>
        dept.departmentName?.toLowerCase().includes(this.searchQuery) ||
        dept.short?.toLowerCase().includes(this.searchQuery) ||
        dept.description?.toLowerCase().includes(this.searchQuery)
      );
    }

    // Sort
    if (this.sortValue === 'name_asc') {
      result.sort((a, b) => (a.departmentName || '').localeCompare(b.departmentName || ''));
    } else if (this.sortValue === 'name_desc') {
      result.sort((a, b) => (b.departmentName || '').localeCompare(a.departmentName || ''));
    }

    this.filteredDepartments = result;
  }

  navigateToDepartment(slug: string | undefined) {
    if(!slug) return;
    this.router.navigate(['/department-details', slug]);
  }

  viewAllDepartments() {
    this.router.navigate(['/department']);
  }

}
