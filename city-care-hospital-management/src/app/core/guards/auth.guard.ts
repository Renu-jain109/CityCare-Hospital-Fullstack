import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const admin = authService.getCurrentAdmin();

  if (admin && admin.role === 'admin') {
    return true;
  }
  
  router.navigate(['/admin/login']);
  return false;
};

export const userGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const user = authService.currentUser();

  if (user) {
    return true;
  }
  
  router.navigate(['/login']);
  return false;
};
