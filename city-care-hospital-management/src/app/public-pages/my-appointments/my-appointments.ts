import { Component, inject, effect, OnInit, OnDestroy, runInInjectionContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Heading } from '../../shared/ui/heading/heading';
import { Card } from '../../shared/ui/card/card';
import { AuthService } from '../../core/services/auth.service';
import { AppointmentService } from '../../core/services/appointment-service';
import { AppointmentInterface } from '../../core/interfaces/appointment-interface';
import { RouterLink } from '@angular/router';
import { ConfirmationService, ConfirmationData } from '../../core/services/confirmation.service';
import { HtmlDialogService, HtmlDialogData } from '../../core/services/html-dialog.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule, Heading, Card, RouterLink],
  templateUrl: './my-appointments.html',
  styles: ``
})
export class MyAppointments implements OnInit, OnDestroy {
  authService = inject(AuthService);
  appointmentService = inject(AppointmentService);
  confirmationService = inject(ConfirmationService);
  htmlDialogService = inject(HtmlDialogService);
  
  user = this.authService.currentUser;
  appointments: AppointmentInterface[] = [];
  isLoading = false;
  
  private appointmentsSubscription: Subscription | null = null;
  private currentUserEmail: string | null = null;

  ngOnInit() {
    const currentUser = this.user();
    if (currentUser && currentUser.email) {
      this.currentUserEmail = currentUser.email;
      console.log('ngOnInit - loading appointments for:', this.currentUserEmail);
      this.loadAppointmentsAndSetupRealtime(currentUser.email);
    }
  }

  ngOnDestroy() {
    if (this.appointmentsSubscription) {
      console.log('Unsubscribing from appointments');
      this.appointmentsSubscription.unsubscribe();
      this.appointmentsSubscription = null;
    }
  }

  private loadAppointmentsAndSetupRealtime(userEmail: string) {
    this.isLoading = true;
    
    // Step 1: Unsubscribe from any existing subscription
    if (this.appointmentsSubscription) {
      this.appointmentsSubscription.unsubscribe();
      this.appointmentsSubscription = null;
    }
    
    // Step 2: Load initial data
    console.log('Loading initial appointments for:', userEmail);
    this.appointmentService.getAppointmentsByPatient(userEmail).subscribe({
      next: (data) => {
        console.log('Initial load - appointments:', data.length);
        this.appointments = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Initial load error:', err);
        this.isLoading = false;
      }
    });
    
    // Step 3: Subscribe to real-time updates
    console.log('Subscribing to real-time updates');
    console.log('Current BehaviorSubject value:', this.appointmentService.appointmentsSubject.value.length);
    
    this.appointmentsSubscription = this.appointmentService.appointments$.subscribe({
      next: (allAppointments) => {
        console.log('=== REAL-TIME UPDATE ===');
        console.log('Received appointments:', allAppointments.length);
        console.log('BehaviorSubject direct value:', this.appointmentService.appointmentsSubject.value.length);
        
        if (allAppointments.length === 0) {
          console.warn('WARNING: Received 0 appointments in real-time update!');
          console.warn('This means admin updates are not reaching this user.');
        }
        
        const userAppointments = allAppointments.filter(a => a.email === userEmail);
        console.log('Filtered for user:', userEmail, '- found:', userAppointments.length);
        
        // Always update the list, even if empty (to clear old data if needed)
        this.appointments = userAppointments;
        this.isLoading = false;
        console.log('=== END REAL-TIME UPDATE ===');
      },
      error: (err) => {
        console.error('Real-time subscription error:', err);
      }
    });
  }

  fetchAppointments(email: string) {
    this.isLoading = true;
    this.appointmentService.getAppointmentsByPatient(email).subscribe({
        next: (data) => {
            this.appointments = data;
            this.isLoading = false;
        },
        error: (err) => {
            console.error('Error loading appointments', err);
            this.isLoading = false;
        }
    });
  }

  // Patient Actions
  cancelAppointment(appointment: AppointmentInterface) {
    const confirmationData: ConfirmationData = {
      title: 'Cancel Appointment',
      message: `Are you sure you want to cancel your appointment with ${appointment.doctorName} on ${appointment.appointmentDate}?`,
      confirmText: 'Yes, Cancel',
      cancelText: 'No, Keep'
    };
    
    this.confirmationService.confirm(confirmationData).then(result => {
      if (result) {
        this.appointmentService.updateAppointmentStatus(appointment._id || appointment.appointmentCode, 'cancelled', 'Patient cancelled appointment').subscribe({
          next: () => {
            // Update local status
            appointment.status = 'cancelled';
            console.log('Appointment cancelled successfully');
          },
          error: (err: any) => {
            console.error('Error cancelling appointment', err);
          }
        });
      }
    });
  }

  rescheduleAppointment(appointment: AppointmentInterface) {
    const confirmationData: ConfirmationData = {
      title: 'Reschedule Appointment',
      message: `Would you like to reschedule your appointment with ${appointment.doctorName}? You will need to book a new appointment.`,
      confirmText: 'Book New Appointment',
      cancelText: 'Cancel'
    };
    
    this.confirmationService.confirm(confirmationData).then(result => {
      if (result) {
        // Navigate to book appointment page with pre-filled data
        console.log('Navigate to book appointment with pre-filled data');
      }
    });
  }

  downloadInvoice(appointment: AppointmentInterface) {
    // Generate invoice download
    const invoiceData = {
      appointmentCode: appointment.appointmentCode,
      patientName: appointment.patientName,
      doctorName: appointment.doctorName,
      department: appointment.department,
      date: appointment.appointmentDate,
      time: appointment.timeSlot,
      consultationFee: (appointment as any).consultationFee || 500
    };

    // Enhanced invoice with complete details using HTML dialog
    const dialogData: HtmlDialogData = {
      title: 'Invoice Details',
      message: `
        <div style="font-family: Arial, sans-serif; text-align: left; line-height: 1.5;">
          <!-- Invoice Header -->
          <div style="background: #005EB8; padding: 12px; border-radius: 10px; text-align: center; color: white; margin-bottom: 12px;">
            <div style="font-size: 20px; margin-bottom: 4px;">🏥</div>
            <h2 style="margin: 0; font-size: 16px; font-weight: bold;">City Care Hospital</h2>
            <p style="margin: 2px 0 0 0; font-size: 11px; opacity: 0.9;">Invoice for Medical Consultation</p>
          </div>
          
          <!-- Invoice Number and Date -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 2px solid #005EB8; padding-bottom: 10px;">
            <div>
              <p style="margin: 0; font-size: 11px; color: #666;">Invoice Number</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #005EB8; font-size: 14px;">INV-${appointment.appointmentCode}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; font-size: 11px; color: #666;">Date</p>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 14px;">${new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </div>
          
          <!-- Patient Information -->
          <div style="background: white; padding: 12px; border-radius: 10px; margin-bottom: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h4 style="color: #005EB8; margin: 0 0 10px 0; font-size: 14px; display: flex; align-items: center; gap: 6px;">
              <span>👤</span> Patient Information
            </h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <p style="margin: 0; font-size: 11px; color: #666;">Name</p>
                <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${appointment.patientName}</p>
              </div>
              <div>
                <p style="margin: 0; font-size: 11px; color: #666;">Email</p>
                <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${appointment.email || 'N/A'}</p>
              </div>
              <div>
                <p style="margin: 0; font-size: 11px; color: #666;">Mobile</p>
                <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${appointment.mobile || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          <!-- Appointment Details -->
          <div style="background: white; padding: 12px; border-radius: 10px; margin-bottom: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h4 style="color: #005EB8; margin: 0 0 10px 0; font-size: 14px; display: flex; align-items: center; gap: 6px;">
              <span>📅</span> Appointment Details
            </h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <p style="margin: 0; font-size: 11px; color: #666;">Appointment ID</p>
                <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${appointment.appointmentCode}</p>
              </div>
              <div>
                <p style="margin: 0; font-size: 11px; color: #666;">Department</p>
                <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${appointment.department}</p>
              </div>
              <div>
                <p style="margin: 0; font-size: 11px; color: #666;">Doctor</p>
                <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">Dr. ${appointment.doctorName}</p>
              </div>
              <div>
                <p style="margin: 0; font-size: 11px; color: #666;">Date & Time</p>
                <p style="margin: 2px 0 0 0; font-weight: 600; color: #333; font-size: 13px;">${appointment.appointmentDate} ${appointment.timeSlot}</p>
              </div>
            </div>
          </div>
          
          <!-- Payment Details -->
          <div style="background: white; padding: 12px; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h4 style="color: #005EB8; margin: 0 0 10px 0; font-size: 14px; display: flex; align-items: center; gap: 6px;">
              <span>💰</span> Payment Details
            </h4>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e5e7eb; padding-top: 10px;">
              <div>
                <p style="margin: 0; font-size: 13px; color: #333;">Medical Consultation Fee</p>
              </div>
              <div>
                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #10b981;">₹${(appointment as any).consultationFee || 500}</p>
              </div>
            </div>
          </div>
        </div>
      `,
      confirmText: 'Download PDF',
      cancelText: 'Close',
      showCancel: true,
      width: '650px'
    };
    
    this.htmlDialogService.showDialog(dialogData).then(result => {
      if (result) {
        console.log('Download invoice PDF for:', invoiceData);
        // Here you would implement actual PDF generation
        this.confirmationService.confirm({
          title: 'PDF Download',
          message: 'Invoice PDF download feature will be implemented soon! For now, you can take a screenshot of this invoice.',
          confirmText: 'OK',
          showCancel: false
        });
      }
    });
  }
}
