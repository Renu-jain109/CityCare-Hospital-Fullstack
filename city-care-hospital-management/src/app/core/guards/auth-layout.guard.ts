import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authLayoutGuard: CanActivateFn = (route, state) => {
  // This guard will be used to hide navbar/footer on auth pages
  // We'll use a service to communicate with the main layout
  return true;
};
