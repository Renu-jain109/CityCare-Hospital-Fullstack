import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Heading } from "../../../shared/ui/heading/heading";
import { SpecialitiesCard } from '../../../shared/sections/specialities-card/specialities-card';
import { DepartmentService } from '../../../core/services/department-service';
import { DepartmentInterface } from '../../../core/interfaces/department-interface';


@Component({
  selector: 'app-department',
  imports: [CommonModule, SpecialitiesCard, Heading],
  templateUrl: './department.html',
  styleUrl: './department.css',
})
export class Department {
  departmentName = '';
  departmentDescription = '';
  doctors: any[] = [];

  constructor(private route: ActivatedRoute, private router: Router) { }
  departmentService = inject(DepartmentService)

  departments: DepartmentInterface[] = [];

  ngOnInit() {
    this.departmentService.getAllDepartmentsFromBackend().subscribe((data) => {
      console.log('departments data', data);
      this.departments = data;
    });
  }

  navigateToDepartment(slug: string | undefined) {
    if(!slug) return;
    this.router.navigate(['/department-details', slug]);
  }

}

