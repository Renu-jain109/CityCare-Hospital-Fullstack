import { Injectable } from '@angular/core';

declare const confirm: (message?: string, confirmText?: string, cancelText?: string) => boolean;
declare const alert: (message?: string) => void;

export interface ConfirmationData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  confirm(data: ConfirmationData): Promise<boolean> {
    return new Promise((resolve) => {
      // Use native browser confirm for simplicity
      const message = data.message || '';
      const shouldConfirm = data.showCancel !== false;
      
      if (shouldConfirm) {
        const result = confirm(message, data.confirmText || 'Confirm', data.cancelText || 'Cancel');
        resolve(result);
      } else {
        // Just show alert if no confirmation needed
        alert(message);
        resolve(true);
      }
    });
  }
}
