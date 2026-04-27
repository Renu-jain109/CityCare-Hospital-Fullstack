import { Injectable, inject, OnDestroy } from '@angular/core';
import { AppointmentInterface } from '../interfaces/appointment-interface';
import { BehaviorSubject, Observable, of, shareReplay, Subject } from 'rxjs';
import { map, tap, takeUntil } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService implements OnDestroy {

  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl
  private appointments: AppointmentInterface[] = [];
  private destroy$ = new Subject<void>();

  // BehaviorSubject for real-time updates
  appointmentsSubject = new BehaviorSubject<AppointmentInterface[]>([]);
  appointments$ = this.appointmentsSubject.asObservable().pipe(
    shareReplay(1),
    takeUntil(this.destroy$)
  );

  // Cross-tab communication using BroadcastChannel API
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    // Setup cross-tab communication
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('appointments_channel');
      this.broadcastChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'appointments_updated') {
          this.refreshFromBroadcast();
        }
      };
    }
    
    // Listen to storage events for older browsers
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === 'appointments_updated' && event.newValue) {
          this.refreshFromBroadcast();
        }
      });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }
  }

  // Notify other tabs about appointment updates
  private notifyOtherTabs() {
    // Method 1: BroadcastChannel (modern browsers)
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'appointments_updated', timestamp: Date.now() });
    }
    
    // Method 2: localStorage (fallback for older browsers)
    if (typeof window !== 'undefined') {
      localStorage.setItem('appointments_updated', Date.now().toString());
      // Clear after a short delay
      setTimeout(() => {
        localStorage.removeItem('appointments_updated');
      }, 1000);
    }
  }

  // Refresh data when notified by other tabs
  private refreshFromBroadcast() {
    this.getAllAppointments().subscribe();
  }

  // Helper method to get headers with authentication
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Helper method to get headers with admin authentication
  private getAdminAuthHeaders(): HttpHeaders {
    const token = this.authService.getAdminToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }


  bookAppointment(data: AppointmentInterface): Observable<any> {
    return this.http.post(`${this.apiUrl}/appointments`, data, { headers: this.getAuthHeaders() }).pipe(
      tap({
        error: (err) => console.error('Booking API error:', err)
      })
    );
  }

  getSlotByDate(doctorId: string, date: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/appointments/slots?doctorId=${doctorId}&date=${date}`, { headers: this.getAuthHeaders() });
  }

  getAllAppointments(): Observable<AppointmentInterface[]> {
    return this.http
      .get<AppointmentInterface[]>(`${this.apiUrl}/appointments`, { headers: this.getAdminAuthHeaders() })
      .pipe(
        map((appointments) => appointments.map((a) => ({
          ...a,
          id: a.appointmentCode || a._id || '',
        }))),
        tap((appointments) => this.appointmentsSubject.next(appointments))
      );
  }

  getById(id: string) {
    return this.appointments.find(a => a.appointmentCode === id);
  }

  // Get appointments for a specific patient by email
  getAppointmentsByPatient(email: string): Observable<AppointmentInterface[]> {
    return this.http.get<AppointmentInterface[]>(`${this.apiUrl}/appointments/patient/${email}`, { headers: this.getAuthHeaders() });
  }

  // Update appointment status
  updateAppointmentStatus(appointmentId: string, status: string, notes?: string): Observable<any> {
    const updateData = {
      status,
      notes,
      updatedAt: new Date().toISOString()
    };
    return this.http.put(`${this.apiUrl}/appointments/${appointmentId}/status`, updateData, { headers: this.getAuthHeaders() }).pipe(
      tap(() => {
        this.getAllAppointments().subscribe({
          next: () => this.notifyOtherTabs()
        });
      })
    );
  }

  updateAppointment(appointmentId: string, appointmentData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/appointments/${appointmentId}`, appointmentData, { headers: this.getAuthHeaders() }).pipe(
      tap(() => this.getAllAppointments().subscribe({ next: () => this.notifyOtherTabs() }))
    );
  }

  deleteAppointment(appointmentId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/appointments/${appointmentId}`, { headers: this.getAuthHeaders() }).pipe(
      tap(() => this.getAllAppointments().subscribe({ next: () => this.notifyOtherTabs() }))
    );
  }

  // deleteById(id: string): void {
  //   this.appointments = this.appointments.filter(appointment => 
  //     appointment.appointmentCode !== id && appointment._id !== id
  //   );
  // }
}
