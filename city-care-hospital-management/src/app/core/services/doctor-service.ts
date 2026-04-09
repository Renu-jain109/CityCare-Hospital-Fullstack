import { Injectable, inject } from '@angular/core';
import { DoctorInterface } from '../interfaces/doctor-interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class DoctorService {

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


  addDoctor(doctorData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/doctors`, doctorData, { headers: this.getAuthHeaders() });
  }

  updateDoctor(doctorId: string, doctorData: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/doctors/${doctorId}`, doctorData, { headers: this.getAuthHeaders() });
  }

  deleteDoctor(doctorId: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/doctors/${doctorId}`, { headers: this.getAuthHeaders() });
  }

  getAllDoctors(): Observable<DoctorInterface[]> {
    return this.http.get<DoctorInterface[]>(`${environment.apiUrl}/doctors`, { headers: this.getAuthHeaders() });
  }

  getDoctorsByDepartment(department: string): Observable<DoctorInterface[]> {
    if(!department) {
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }

    return this.http.get<DoctorInterface[]>(`${environment.apiUrl}/doctors/by-department?department=${department}`, { headers: this.getAuthHeaders() });
  }

}

