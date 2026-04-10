import { Component, inject } from '@angular/core';
import { Heading } from "../../../shared/ui/heading/heading";
import { DoctorInterface } from '../../../core/interfaces/doctor-interface';
import { DoctorService } from '../../../core/services/doctor-service';
import { Card } from "../../../shared/ui/card/card";
import { Router } from '@angular/router';

@Component({
  selector: 'app-doctor-list',
  imports: [Heading, Card],
  templateUrl: './doctor-list.html',
  styleUrl: './doctor-list.css',
})
export class DoctorList {

  doctorService = inject(DoctorService);
  router = inject(Router);

  allDoctor: DoctorInterface[] = [];

  ngOnInit() {
    this.doctorService.getAllDoctors().subscribe((doctors) => {
      console.log('doctors', doctors);
      this.allDoctor = doctors;
    });
  }

  navigateToDoctorDetails(slug: string) {
    this.router.navigate(['/doctor-details', slug]);
  }

}

