import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private apiUrl = environment.apiUrl + '/auth';

  currentUser = signal<any>(null);
  currentAdmin = signal<any>(null);

  constructor() {
    this.loadUserFromStorage();
    this.loadAdminFromStorage();
  }

  loadUserFromStorage() {
    const user = localStorage.getItem('user');
    if (user) {
      this.currentUser.set(JSON.parse(user));
    }
  }

  loadAdminFromStorage() {
    const admin = localStorage.getItem('admin');
    if (admin) {
      this.currentAdmin.set(JSON.parse(admin));
    }
  }

  login(credentials: { email: string, password: string }, isAdminLogin: boolean = false) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (isAdminLogin && res.role !== 'admin') {
          throw new Error('Not authorized as an admin');
        }
        
        if (isAdminLogin) {
          localStorage.setItem('admin', JSON.stringify(res));
          this.currentAdmin.set(res);
        } else {
          localStorage.setItem('user', JSON.stringify(res));
          this.currentUser.set(res);
        }
      })
    );
  }

  register(userData: any) {
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      tap(res => {
        localStorage.setItem('user', JSON.stringify(res));
        this.currentUser.set(res);
      })
    );
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  logoutAdmin() {
    localStorage.removeItem('admin');
    this.currentAdmin.set(null);
    this.router.navigate(['/admin/login']);
  }

  getToken() {
    const user = localStorage.getItem('user');
    if (user) {
      const userObj = JSON.parse(user);
      return userObj.token;
    }
    return null;
  }

  getAdminToken() {
    const admin = localStorage.getItem('admin');
    if (admin) {
      const adminObj = JSON.parse(admin);
      return adminObj.token;
    }
    return null;
  }

  // getCurrentUser() {
  //   return this.currentUser();
  // }

  getCurrentAdmin() {
    return this.currentAdmin();
  }
}
