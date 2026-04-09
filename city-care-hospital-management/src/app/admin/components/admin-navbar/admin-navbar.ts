import { Component, EventEmitter, Output, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-navbar',
  imports: [],
  templateUrl: './admin-navbar.html',
  styleUrl: './admin-navbar.css',
})
export class AdminNavbar {
  @Output() menuClick = new EventEmitter<void>();
  private authService = inject(AuthService);
  
  get adminName() {
    const admin = this.authService.getCurrentAdmin();
    return admin?.name || 'Admin';
  }
}
