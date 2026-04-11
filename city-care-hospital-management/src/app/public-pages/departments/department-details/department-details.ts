import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DepartmentInterface } from '../../../core/interfaces/department-interface';
import { DepartmentService } from '../../../core/services/department-service';
import { Button } from '../../../shared/ui/button/button';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-department-details',
  imports: [CommonModule,RouterLink,Button ],
  templateUrl: './department-details.html',
  styleUrl: './department-details.css',
})
export class DepartmentDetails implements OnInit, OnDestroy {

  department?: DepartmentInterface;
  private routeSub?: Subscription;

  constructor(private departmentService: DepartmentService,
    public router: Router
  ) { }
  route = inject(ActivatedRoute)

  ngOnInit(): void {
    // Subscribe to route params to handle navigation between different departments
    this.routeSub = this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.loadDepartment(slug);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  private loadDepartment(slug: string): void {
    this.departmentService.getAllDepartmentsFromBackend().subscribe((depts: any[]) => {
      this.department = depts.find(d => d.slug === slug);
    });
  }

  goToHome(){
    this.router.navigate(['/']);
  }
  goToBookAppointment(){
    this.router.navigate(['book-appointment'], {queryParams: {department: this.department?.departmentName}});
  }
}
