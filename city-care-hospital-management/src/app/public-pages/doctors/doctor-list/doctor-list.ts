import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorInterface } from '../../../core/interfaces/doctor-interface';
import { DoctorService } from '../../../core/services/doctor-service';
import { DepartmentService } from '../../../core/services/department-service';
import { DepartmentInterface } from '../../../core/interfaces/department-interface';
import { Router } from '@angular/router';
import { Heading } from '../../../shared/ui/heading/heading';

@Component({
  selector: 'app-doctor-list',
  imports: [CommonModule, FormsModule, Heading],
  templateUrl: './doctor-list.html',
  styleUrl: './doctor-list.css',
})
export class DoctorList implements OnInit {

  doctorService = inject(DoctorService);
  departmentService = inject(DepartmentService);
  router = inject(Router);

  allDoctor: DoctorInterface[] = [];
  filteredDoctors: DoctorInterface[] = [];
  departments: DepartmentInterface[] = [];

  // Filter values
  selectedDepartment: string = '';
  selectedExperience: string = '';
  selectedAvailability: string = '';

  // View mode
  showAllDoctors: boolean = false;

  // Filter options
  experienceOptions = [
    { label: 'All Experience', value: '' },
    { label: '0-5 years', value: '0-5' },
    { label: '5-10 years', value: '5-10' },
    { label: '10+ years', value: '10+' }
  ];

  availabilityOptions = [
    { label: 'All Availability', value: '' },
    { label: 'Available Today', value: 'today' },
    { label: 'Not Available', value: 'off' }
  ];

  ngOnInit() {
    // Load only Active doctors for public UI
    this.doctorService.getActiveDoctors().subscribe((doctors) => {
      this.allDoctor = doctors;
      this.filteredDoctors = doctors;
    });

    // Load only Active departments for public UI
    this.departmentService.getActiveDepartments().subscribe((depts) => {
      this.departments = depts;
    });
  }

  // Parse availability string and check if doctor is currently available
  getAvailabilityStatus(doctor: DoctorInterface): { text: string; icon: string; color: string; isAvailable: boolean } {
    const availability = doctor.availability;
    if (!availability) {
      return { text: 'Schedule not set', icon: 'fas fa-question-circle', color: 'text-gray-400', isAvailable: false };
    }

    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue, etc.
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes

    // Parse availability string like "Mon-Sat (9AM - 2PM)" or "Mon - Sat (10AM - 5PM)"
    const availLower = availability.toLowerCase();

    // Extract days range (e.g., "mon-sat", "mon - sat")
    const daysMatch = availLower.match(/(mon|tue|wed|thu|fri|sat|sun)[^a-z]*(mon|tue|wed|thu|fri|sat|sun)/);

    // Check if today is in available days
    const dayOrder = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const currentDayIndex = dayOrder.indexOf(currentDay.toLowerCase());

    let isDayAvailable = false;
    if (daysMatch) {
      const startDay = daysMatch[1];
      const endDay = daysMatch[2];
      const startIndex = dayOrder.indexOf(startDay);
      const endIndex = dayOrder.indexOf(endDay);

      if (startIndex <= endIndex) {
        isDayAvailable = currentDayIndex >= startIndex && currentDayIndex <= endIndex;
      } else {
        // Wrap around week (e.g., Sat-Mon)
        isDayAvailable = currentDayIndex >= startIndex || currentDayIndex <= endIndex;
      }
    } else if (availLower.includes(currentDay.toLowerCase())) {
      isDayAvailable = true;
    }

    // Extract time range (e.g., "9AM - 2PM", "10:00 AM - 5:00 PM")
    const timeMatch = availability.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM|am|pm)?[^\d]*(\d{1,2}):?(\d{2})?\s*(AM|PM|am|pm)/i);

    let isTimeAvailable = false;
    if (timeMatch) {
      const startHour = parseInt(timeMatch[1]);
      const startMin = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const startPeriod = timeMatch[3] ? timeMatch[3].toUpperCase() : 'AM';
      const endHour = parseInt(timeMatch[4]);
      const endMin = timeMatch[5] ? parseInt(timeMatch[5]) : 0;
      const endPeriod = timeMatch[6] ? timeMatch[6].toUpperCase() : 'PM';

      // Convert to 24-hour format
      let start24 = startHour;
      if (startPeriod === 'PM' && startHour !== 12) start24 += 12;
      if (startPeriod === 'AM' && startHour === 12) start24 = 0;

      let end24 = endHour;
      if (endPeriod === 'PM' && endHour !== 12) end24 += 12;
      if (endPeriod === 'AM' && endHour === 12) end24 = 0;

      const startTimeMinutes = start24 * 60 + startMin;
      const endTimeMinutes = end24 * 60 + endMin;

      isTimeAvailable = currentTime >= startTimeMinutes && currentTime <= endTimeMinutes;
    } else {
      // If no time specified, assume available if day matches
      isTimeAvailable = true;
    }

    const isAvailable = isDayAvailable && isTimeAvailable;

    if (isAvailable) {
      return { text: 'Available Today', icon: 'fas fa-check-circle', color: 'text-green-600', isAvailable: true };
    } else if (isDayAvailable && !isTimeAvailable) {
      return { text: 'Closed Now', icon: 'fas fa-clock', color: 'text-orange-400', isAvailable: false };
    } else {
      // Find next available day
      const nextDay = this.getNextAvailableDay(availability, currentDayIndex, dayOrder);
      return { text: `Next: ${nextDay}`, icon: 'fas fa-calendar', color: 'text-gray-400', isAvailable: false };
    }
  }

  // Get next available day
  getNextAvailableDay(availability: string, currentDayIndex: number, dayOrder: string[]): string {
    const availLower = availability.toLowerCase();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Check each day from tomorrow
    for (let i = 1; i <= 7; i++) {
      const nextIndex = (currentDayIndex + i) % 7;
      const nextDay = dayOrder[nextIndex];
      if (availLower.includes(nextDay)) {
        return days[nextIndex];
      }
    }
    return 'Soon';
  }

  // Legacy method for backward compatibility with filters
  isAvailableToday(doctor: DoctorInterface): boolean {
    return this.getAvailabilityStatus(doctor).isAvailable;
  }

  // Apply filters
  applyFilters() {
    this.filteredDoctors = this.allDoctor.filter(doctor => {
      // Department filter
      if (this.selectedDepartment && doctor.departmentName !== this.selectedDepartment) {
        return false;
      }

      // Experience filter
      if (this.selectedExperience) {
        const exp = parseInt(doctor.experience) || 0;
        if (this.selectedExperience === '0-5' && (exp < 0 || exp > 5)) return false;
        if (this.selectedExperience === '5-10' && (exp < 5 || exp > 10)) return false;
        if (this.selectedExperience === '10+' && exp < 10) return false;
      }

      // Availability filter
      if (this.selectedAvailability) {
        const isAvailable = this.isAvailableToday(doctor);
        if (this.selectedAvailability === 'today' && !isAvailable) return false;
        if (this.selectedAvailability === 'off' && isAvailable) return false;
      }

      return true;
    });
  }

  navigateToDoctorDetails(slug: string) {
    this.router.navigate(['/doctor-details', slug]);
  }

  bookAppointment(doctor: DoctorInterface) {
    this.router.navigate(['/book-appointment'], {
      queryParams: {
        doctor: doctor.doctorName,
        department: doctor.departmentName
      }
    });
  }

}

