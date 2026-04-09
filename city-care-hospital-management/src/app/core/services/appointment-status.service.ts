import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface StatusUpdateRequest {
  appointmentId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  updatedBy: string;
}

export interface StatusHistory {
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  updatedAt: string;
  updatedBy: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentStatusService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // Helper method to get headers with authentication
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Update appointment status (for both admin and user)
  updateAppointmentStatus(request: StatusUpdateRequest): Observable<any> {
    return this.http.put(
      `${environment.apiUrl}/appointments/${request.appointmentId}/status`,
      request,
      { headers: this.getAuthHeaders() }
    );
  }

  // Get appointment status history
  getStatusHistory(appointmentId: string): Observable<StatusHistory[]> {
    return this.http.get<StatusHistory[]>(
      `${environment.apiUrl}/appointments/${appointmentId}/status-history`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Cancel appointment (user action)
  cancelAppointment(appointmentId: string, reason?: string): Observable<any> {
    return this.http.put(
      `${environment.apiUrl}/appointments/${appointmentId}/cancel`,
      { reason, updatedBy: this.authService.getToken() ? 'user' : 'guest' },
      { headers: this.getAuthHeaders() }
    );
  }

  // Confirm appointment (admin action)
  confirmAppointment(appointmentId: string): Observable<any> {
    return this.http.put(
      `${environment.apiUrl}/appointments/${appointmentId}/confirm`,
      { status: 'confirmed', updatedBy: 'admin' },
      { headers: this.getAuthHeaders() }
    );
  }

  // Complete appointment (admin action)
  completeAppointment(appointmentId: string, notes?: string): Observable<any> {
    return this.http.put(
      `${environment.apiUrl}/appointments/${appointmentId}/complete`,
      { status: 'completed', notes, updatedBy: 'admin' },
      { headers: this.getAuthHeaders() }
    );
  }
}
