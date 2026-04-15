import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DepartmentInterface } from '../interfaces/department-interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  
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

  // For public pages - detailed department info
  departments: DepartmentInterface[] = []

  // Backend API methods for admin
  addDepartment(departmentData: any): Observable<any> {
    // Process form data before sending
    const processedData = {
      // Basic Info (Mandatory)
      departmentName: departmentData.departmentName,
      headOfDepartment: departmentData.headOfDepartment,
      status: departmentData.status || 'Active',
      
      // Details (Optional) - send as they are
      slug: departmentData.slug || '',
      icon: departmentData.icon || '',
      short: departmentData.short || '',
      subtitle: departmentData.subtitle || '',
      bannerImage: departmentData.bannerImage || '',
      description: departmentData.description || '',
      
      // Medical Info (Optional) - send as they are
      treatments: departmentData.treatments || [],
      faqs: departmentData.faqs || [],
      doctorIds: departmentData.doctorIds || [],
      
      // Additional Info
      numberOfDoctors: departmentData.numberOfDoctors || 0
    };
    
    return this.http.post(`${environment.apiUrl}/departments`, processedData, { headers: this.getAuthHeaders() });
  }

  updateDepartment(departmentId: string, departmentData: any): Observable<any> {
    // Process form data before sending
    const processedData = {
      // Basic Info (Mandatory)
      departmentName: departmentData.departmentName,
      headOfDepartment: departmentData.headOfDepartment,
      status: departmentData.status || 'Active',
      
      // Details (Optional) - send as they are
      slug: departmentData.slug || '',
      icon: departmentData.icon || '',
      short: departmentData.short || '',
      subtitle: departmentData.subtitle || '',
      bannerImage: departmentData.bannerImage || '',
      description: departmentData.description || '',
      
      // Medical Info (Optional) - send as they are
      treatments: departmentData.treatments || [],
      faqs: departmentData.faqs || [],
      doctorIds: departmentData.doctorIds || [],
      
      // Additional Info
      numberOfDoctors: departmentData.numberOfDoctors || 0
    };
    
    return this.http.put(`${environment.apiUrl}/departments/${departmentId}`, processedData, { headers: this.getAuthHeaders() });
  }

  deleteDepartment(departmentId: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/departments/${departmentId}`, { headers: this.getAuthHeaders() });
  }

  getAllDepartmentsFromBackend(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/departments`, { headers: this.getAuthHeaders() });
  }

  // Get only Active departments (for patient side booking)
  getActiveDepartments(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/departments/active`, { headers: this.getAuthHeaders() });
  }

  getDepartmentById(departmentId: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/departments/${departmentId}`, { headers: this.getAuthHeaders() });
  }

  // For public pages - detailed department info
  getAllDepartments(): DepartmentInterface[] {
    return this.departments
  }

}
