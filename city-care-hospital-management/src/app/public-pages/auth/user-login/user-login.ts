import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { LayoutService } from '../../../core/services/layout.service';

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-login.html',
  styleUrl: './user-login.css'
})
export class UserLogin implements OnDestroy {
  fb = inject(FormBuilder);
  router = inject(Router);
  authService = inject(AuthService);
  layoutService = inject(LayoutService);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  errorMessage = '';

  constructor() {
    // Hide navbar and footer for login page
    this.layoutService.hideLayout();
  }

  ngOnDestroy() {
    // Show navbar and footer when leaving login page
    this.layoutService.displayLayout();
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const formData = this.loginForm.value;
    if (formData.email && formData.password) {
      this.authService.login({ email: formData.email, password: formData.password }).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Login failed. Please try again.';
        }
      });
    }
  }
}
