import { Component, inject } from '@angular/core';
import { DoctorInterface } from '../../../core/interfaces/doctor-interface';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorService } from '../../../core/services/doctor-service';
import { CommonModule } from '@angular/common';
import { Button } from '../../../shared/ui/button/button';

@Component({
  selector: 'app-doctor-details',
  imports: [CommonModule,Button],
  templateUrl: './doctor-details.html',
  styleUrl: './doctor-details.css',
})
export class DoctorDetails {
    doctor?: DoctorInterface ;

  constructor(private doctorService: DoctorService,
    public router: Router
  ) { }
  route = inject(ActivatedRoute)

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    if (slug) {
      this.doctorService.getAllDoctors().subscribe((doctors: DoctorInterface[]) => {
        this.doctor = doctors.find(d => d.slug === slug);
      });
    }
  }

  goToHome(){
    this.router.navigate(['/']);
  }
  goToBookAppointment(){
    this.router.navigate(['book-appointment'], {
      queryParams: {
        department: this.doctor?.departmentName,
        doctor: this.doctor?.doctorName
      }
    });
  }
}





