import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

import { PharmacyOrder } from '../interfaces/order-interface';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/orders`;

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

  // Place a new pharmacy order
  createOrder(order: PharmacyOrder): Observable<PharmacyOrder> {
    return this.http.post<PharmacyOrder>(this.apiUrl, order, { headers: this.getAuthHeaders() });
  }

  // Get orders for a specific patient by email
  getOrdersByPatient(email: string): Observable<PharmacyOrder[]> {
    return this.http.get<PharmacyOrder[]>(`${this.apiUrl}/patient/${email}`, { headers: this.getAuthHeaders() });
  }

  // Get all orders for Admin
  getAllOrders(): Observable<PharmacyOrder[]> {
    return this.http.get<PharmacyOrder[]>(this.apiUrl, { headers: this.getAdminAuthHeaders() });
  }

  // Update order status (Admin)
  updateOrderStatus(orderId: string, status: string): Observable<PharmacyOrder> {
    return this.http.put<PharmacyOrder>(`${this.apiUrl}/${orderId}/status`, { status }, { headers: this.getAdminAuthHeaders() });
  }
}
