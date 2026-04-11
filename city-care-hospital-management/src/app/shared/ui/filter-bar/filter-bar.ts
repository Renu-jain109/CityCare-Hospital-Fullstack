import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterValues {
  search: string;
  category: string;
  sort: string;
}

@Component({
  selector: 'app-filter-bar',
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.css',
})
export class FilterBar {
  // Visibility flags
  @Input() showSearch: boolean = true;
  @Input() showCategory: boolean = true;
  @Input() showSort: boolean = true;

  // Options for dropdowns
  @Input() categoryOptions: FilterOption[] = [{ label: 'All Categories', value: '' }];
  @Input() sortOptions: FilterOption[] = [
    { label: 'Sort by', value: '' },
    { label: 'Name (A-Z)', value: 'name_asc' },
    { label: 'Name (Z-A)', value: 'name_desc' }
  ];

  // Current values
  searchValue: string = '';
  categoryValue: string = '';
  sortValue: string = '';

  // Output events
  @Output() filtersChange = new EventEmitter<FilterValues>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() categoryChange = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<string>();

  onSearchChange() {
    this.searchChange.emit(this.searchValue);
    this.emitAllFilters();
  }

  onCategoryChange() {
    this.categoryChange.emit(this.categoryValue);
    this.emitAllFilters();
  }

  onSortChange() {
    this.sortChange.emit(this.sortValue);
    this.emitAllFilters();
  }

  clearFilters() {
    this.searchValue = '';
    this.categoryValue = '';
    this.sortValue = '';
    this.emitAllFilters();
  }

  private emitAllFilters() {
    this.filtersChange.emit({
      search: this.searchValue,
      category: this.categoryValue,
      sort: this.sortValue
    });
  }
}
