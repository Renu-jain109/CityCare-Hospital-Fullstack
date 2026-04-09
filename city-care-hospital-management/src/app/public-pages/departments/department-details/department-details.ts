import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DepartmentInterface } from '../../../core/interfaces/department-interface';
import { DepartmentService } from '../../../core/services/department-service';
import { Button } from '../../../shared/ui/button/button';

@Component({
  selector: 'app-department-details',
  imports: [CommonModule,RouterLink,Button ],
  templateUrl: './department-details.html',
  styleUrl: './department-details.css',
})
export class DepartmentDetails implements OnInit {

  department?: DepartmentInterface ;

  constructor(private departmentService: DepartmentService,
    public router: Router
  ) { }
  route = inject(ActivatedRoute)

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    if (slug) {
      this.departmentService.getAllDepartmentsFromBackend().subscribe((depts: any[]) => {
        this.department = depts.find(d => d.slug === slug);
      });
    }
  }

  goToHome(){
    this.router.navigate(['/']);
  }
  goToBookAppointment(){
    this.router.navigate(['book-appointment'], {queryParams: {department: this.department?.departmentName}});
  }
}
