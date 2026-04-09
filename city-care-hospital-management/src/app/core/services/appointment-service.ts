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
          console.log('Received cross-tab update, refreshing appointments...');
          this.refreshFromBroadcast();
        }
      };
    }
    
    // Listen to storage events for older browsers
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === 'appointments_updated' && event.newValue) {
          console.log('Received storage event update, refreshing...');
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
    console.log('Cross-tab refresh triggered');
    this.getAllAppointments().subscribe({
      next: (appointments) => {
        console.log('Refreshed from broadcast:', appointments.length, 'appointments');
      },
      error: (err) => {
        console.error('Error refreshing from broadcast:', err);
      }
    });
  }

  // Helper method to get headers with authentication
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }


  bookAppointment(data: AppointmentInterface): Observable<any> {
    return this.http.post(`${this.apiUrl}/appointments`, data, { headers: this.getAuthHeaders() });
  }

  getSlotByDate(doctorId: string, date: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/appointments/slots?doctorId=${doctorId}&date=${date}`, { headers: this.getAuthHeaders() });
  }

  getAllAppointments(): Observable<AppointmentInterface[]> {
    console.log('getAllAppointments called - fetching from server...');
    return this.http
      .get<AppointmentInterface[]>(`${this.apiUrl}/appointments`, { headers: this.getAuthHeaders() })
      .pipe(
        map((appointments) => {
          console.log('Raw appointments from server:', appointments.length);
          return appointments.map((a) => ({
            ...a,
            // Ensure the UI can always use `id` even if backend returns `_id`.
            id: a.appointmentCode || a._id || '',
          }));
        }),
        tap((appointments) => {
          console.log('Updating BehaviorSubject with', appointments.length, 'appointments');
          console.log('Current BehaviorSubject subscribers will be notified');
          // Update BehaviorSubject for real-time updates
          this.appointmentsSubject.next(appointments);
        })
      );
  };

  getById(id: string) {
    return this.appointments.find(a => a.appointmentCode === id);
  }

  // Get appointments for a specific patient by email
  getAppointmentsByPatient(email: string): Observable<AppointmentInterface[]> {
    return this.http.get<AppointmentInterface[]>(`${this.apiUrl}/appointments/patient/${email}`, { headers: this.getAuthHeaders() });
  }

  // Backend API methods
  addAppointment(appointmentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/appointments`, appointmentData, { headers: this.getAuthHeaders() });
  }

  // Update appointment status
  updateAppointmentStatus(appointmentId: string, status: string, notes?: string): Observable<any> {
    const updateData = {
      status,
      notes,
      updatedAt: new Date().toISOString()
    };
    console.log('Updating appointment status:', appointmentId, 'to:', status);
    return this.http.put(`${this.apiUrl}/appointments/${appointmentId}/status`, updateData, { headers: this.getAuthHeaders() }).pipe(
      tap(() => {
        console.log('Status update successful, refreshing all appointments...');
        // Refresh appointments list for real-time updates
        this.getAllAppointments().subscribe({
          next: () => {
            console.log('All appointments refreshed after status update');
            // Notify other browser tabs about the update
            this.notifyOtherTabs();
          },
          error: (err) => {
            console.error('Error refreshing appointments after status update:', err);
          }
        });
      })
    );
  }

  updateAppointment(appointmentId: string, appointmentData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/appointments/${appointmentId}`, appointmentData, { headers: this.getAuthHeaders() }).pipe(
      tap(() => {
        // Refresh appointments list for real-time updates
        this.getAllAppointments().subscribe({
          next: () => this.notifyOtherTabs()
        });
      })
    );
  }

  deleteAppointment(appointmentId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/appointments/${appointmentId}`, { headers: this.getAuthHeaders() }).pipe(
      tap(() => {
        // Refresh appointments list for real-time updates
        this.getAllAppointments().subscribe({
          next: () => this.notifyOtherTabs()
        });
      })
    );
  }

  deleteById(id: string): void {
    this.appointments = this.appointments.filter(appointment => 
      appointment.appointmentCode !== id && appointment._id !== id
    );
  }
}
