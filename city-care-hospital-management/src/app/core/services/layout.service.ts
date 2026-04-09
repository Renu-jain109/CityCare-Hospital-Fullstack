import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  // Signal to control navbar and footer visibility
  showLayout = signal(true);
  
  // Method to hide layout (for auth pages)
  hideLayout() {
    this.showLayout.set(false);
  }
  
  // Method to show layout (for regular pages)
  displayLayout() {
    this.showLayout.set(true);
  }
}
