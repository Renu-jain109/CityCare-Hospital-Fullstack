import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from "../../../shared/ui/button/button";
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LayoutService } from '../../../core/services/layout.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [Button, CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-login.html',
  styles: ``
})
export class AdminLogin implements OnDestroy {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  layoutService = inject(LayoutService);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  errorMessage = '';

  constructor() {
    // Hide navbar and footer for admin login page
    this.layoutService.hideLayout();
  }

  ngOnDestroy() {
    // Show navbar and footer when leaving admin login page
    this.layoutService.displayLayout();
  }

  submit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authService.login(this.loginForm.value, true).subscribe({
      next: () => {
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || err.message || 'Login failed. Please try again.';
      }
    });
  }
}
