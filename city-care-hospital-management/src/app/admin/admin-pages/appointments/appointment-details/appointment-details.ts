import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppointmentInterface } from '../../../../core/interfaces/appointment-interface';
import { CommonModule, DatePipe } from '@angular/common';
import { Heading } from "../../../../shared/ui/heading/heading";
import { AppointmentService } from '../../../../core/services/appointment-service';

@Component({
  selector: 'app-appointment-details',
  imports: [DatePipe, CommonModule, Heading],
  templateUrl: './appointment-details.html',
  styleUrl: './appointment-details.css',
})
export class AppointmentDetails implements OnInit {

  route = inject(ActivatedRoute)

  appointment?: AppointmentInterface;

  constructor(private appointmentService: AppointmentService) { };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
this.appointment = this.appointmentService.getById(id!);
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      default:
        return '';
    }
  }
}
