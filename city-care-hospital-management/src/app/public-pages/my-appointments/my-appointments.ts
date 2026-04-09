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
        <div style="font-family: Arial, sans-serif; text-align: left; line-height: 1.8; max-width: 600px; ">
          <!-- Invoice Header -->
          <div style="background: #1e40af; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h2 style="margin: 0; font-size: 24px;">🏥 City Care Hospital</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Invoice for Medical Consultation</p>
          </div>
          
          <!-- Invoice Body -->
          <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e5e7eb;">
            <!-- Invoice Number and Date -->
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">
              <div>
                <strong>Invoice Number:</strong><br>
                <span style="color: #1e40af; font-weight: bold;">INV-${appointment.appointmentCode}</span>
              </div>
              <div style="text-align: right;">
                <strong>Date:</strong><br>
                <span>${new Date().toLocaleDateString('en-IN')}</span>
              </div>
            </div>
            
            <!-- Patient Information -->
            <div style="margin-bottom: 20px;">
              <h3 style="color: #1e40af; margin: 0 0 10px 0;">👤 Patient Information</h3>
              <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
                <p style="margin: 5px 0;"><strong>Name:</strong> ${appointment.patientName}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${appointment.email || 'N/A'}</p>
                <p style="margin: 5px 0;"><strong>Mobile:</strong> ${appointment.mobile || 'N/A'}</p>
              </div>
            </div>
            
            <!-- Appointment Details -->
            <div style="margin-bottom: 20px;">
              <h3 style="color: #1e40af; margin: 0 0 10px 0;">📅 Appointment Details</h3>
              <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
                <p style="margin: 5px 0;"><strong>Appointment ID:</strong> ${appointment.appointmentCode}</p>
                <p style="margin: 5px 0;"><strong>Department:</strong> ${appointment.department}</p>
                <p style="margin: 5px 0;"><strong>Doctor:</strong> Dr. ${appointment.doctorName}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${appointment.appointmentDate}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${appointment.timeSlot}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${appointment.status}</span></p>
              </div>
            </div>
            
            <!-- Payment Details -->
            <div style="margin-bottom: 20px;">
              <h3 style="color: #1e40af; margin: 0 0 10px 0;">💰 Payment Details</h3>
              <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Medical Consultation Fee</td>
                    <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #e5e7eb;">₹${(appointment as any).consultationFee || 500}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Total Amount</strong></td>
                    <td style="padding: 8px 0; text-align: right;"><strong style="color: #10b981; font-size: 18px;">₹${(appointment as any).consultationFee || 500}</strong></td>
                  </tr>
                </table>
              </div>
            </div>
            
          </div>
        </div>
      `,
      confirmText: 'Download PDF',
      cancelText: 'Close',
      showCancel: true,
      width: '600px'
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
