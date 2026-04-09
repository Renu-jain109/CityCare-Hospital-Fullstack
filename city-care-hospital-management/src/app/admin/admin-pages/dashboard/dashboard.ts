import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from '../../../shared/ui/card/card';
import { DoctorService } from '../../../core/services/doctor-service';
import { DepartmentService } from '../../../core/services/department-service';
import { AppointmentService } from '../../../core/services/appointment-service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [ CommonModule, Card, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  stats = [
    {
      title: 'Total Doctors',
      value : '0',
      bgColor : 'bg-doctor-sky-blue',
      RouterLink: '/admin/dashboard/doctors-list'
    },
    {
      title: 'Total Departments',
      value: '0',
      bgColor: 'bg-medicine-green',
      RouterLink: '/admin/dashboard/department-list' 
    },
    {
      title: 'Today Appointments',
      value : '0',
      bgColor : 'bg-yellow-500' ,
      RouterLink: '/admin/dashboard/appointment-list'
    },
    {
      title: 'Pending Appointments',
      value: '0',
      bgColor: 'bg-emergency-red',
      RouterLink: '/admin/dashboard/appointment-list' 
    }
  ]

  constructor(
    private doctorService: DoctorService,
    private departmentService: DepartmentService,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit() {
    this.loadDashboardStats();
  }

  loadDashboardStats() {
    // Load total doctors
    this.doctorService.getAllDoctors().subscribe(doctors => {
      this.stats[0].value = doctors.length.toString();
    });

    // Load total departments
    this.departmentService.getAllDepartmentsFromBackend().subscribe(departments => {
      this.stats[1].value = departments.length.toString();
    });

    // Load today's appointments
    this.appointmentService.getAllAppointments().subscribe(appointments => {
      const today = new Date();
      const todayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate.toDateString() === today.toDateString();
      });
      this.stats[2].value = todayAppointments.length.toString();

      // Load pending appointments
      const pendingAppointments = appointments.filter(apt => 
        apt.status === 'pending'
      );
      this.stats[3].value = pendingAppointments.length.toString();
    });
  }
}
