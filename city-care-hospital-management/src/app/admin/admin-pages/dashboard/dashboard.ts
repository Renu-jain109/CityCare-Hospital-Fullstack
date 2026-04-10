import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DoctorService } from '../../../core/services/doctor-service';
import { DepartmentService } from '../../../core/services/department-service';
import { AppointmentService } from '../../../core/services/appointment-service';
import { OrderService } from '../../../core/services/order.service';
import { Card } from '../../../shared/ui/card/card';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, Card],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  private router = inject(Router);
  currentDate = new Date();

  // Main Stats Cards
  stats = [
    { title: 'Total Doctors', value: '0' },
    { title: 'Departments', value: '0' },
    { title: 'Today Appointments', value: '0' },
    { title: 'Pending', value: '0' }
  ];

  // Recent Appointments
  recentAppointments: any[] = [];

  // Recent Pharmacy Orders
  recentOrders: any[] = [];

  constructor(
    private doctorService: DoctorService,
    private departmentService: DepartmentService,
    private appointmentService: AppointmentService,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.loadDashboardStats();
    this.loadRecentAppointments();
    this.loadRecentOrders();
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

    // Load appointments
    this.appointmentService.getAllAppointments().subscribe(appointments => {
      const today = new Date();
      
      // Today's appointments
      const todayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate.toDateString() === today.toDateString();
      });
      this.stats[2].value = todayAppointments.length.toString();

      // Pending appointments
      const pendingAppointments = appointments.filter(apt => 
        apt.status?.toLowerCase() === 'pending'
      );
      this.stats[3].value = pendingAppointments.length.toString();
    });
  }

  loadRecentAppointments() {
    this.appointmentService.getAllAppointments().subscribe(appointments => {
      // Get 5 most recent appointments
      this.recentAppointments = appointments
        .sort((a: any, b: any) => new Date(b.createdAt || b.appointmentDate).getTime() - new Date(a.createdAt || a.appointmentDate).getTime())
        .slice(0, 5)
        .map((apt: any) => ({
          id: apt.id || apt._id,
          patientName: apt.patientName || apt.patientEmail || 'Unknown',
          doctorName: apt.doctorName || 'Unknown',
          department: apt.department || 'General',
          status: apt.status || 'pending',
          time: this.formatTime(apt.appointmentTime || apt.appointmentDate)
        }));
    });
  }

  loadRecentOrders() {
    this.orderService.getAllOrders().subscribe(orders => {
      // Get 5 most recent orders
      this.recentOrders = orders
        .sort((a: any, b: any) => new Date(b.createdAt || b.orderDate).getTime() - new Date(a.createdAt || a.orderDate).getTime())
        .slice(0, 5)
        .map((order: any) => ({
          id: order.id || order._id,
          patientName: order.patientName || order.patientEmail || 'Unknown',
          medicineName: order.medicineName || order.items?.[0]?.name || 'Medicine',
          quantity: order.quantity || order.items?.length || 1,
          totalPrice: order.totalPrice || order.totalAmount || 0,
          status: order.status || 'pending'
        }));
    });
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  getStatusClass(status: string): string {
    switch(status?.toLowerCase()) {
      case 'completed':
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getOrderStatusClass(status: string): string {
    switch(status?.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'shipped':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
