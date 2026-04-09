import { Component, EventEmitter, Output, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-sidebar.html',
  styles: ``
})
export class AdminSidebar {
  @Output() close = new EventEmitter<void>();
  private authService = inject(AuthService);
  private router = inject(Router);

  onLinkClick() {
    this.close.emit();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
    this.close.emit();
  }
}
