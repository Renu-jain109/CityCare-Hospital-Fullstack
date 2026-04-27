import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ConfirmationDialog } from '../../shared/components/confirmation-dialog/confirmation-dialog';

export interface DialogData {
  title: string;
  message: string | SafeHtml;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialog = inject(MatDialog);
  private sanitizer = inject(DomSanitizer);

  openConfirmationDialog(data: DialogData) {
    return this.dialog.open(ConfirmationDialog, {
      width: '650px',
      data: {
        title: data.title,
        message: data.message,
        confirmText: data.confirmText || 'Confirm',
        cancelText: data.cancelText || 'Cancel',
        showCancel: data.showCancel ?? true
      }
    });
  }

  openHtmlDialog(title: string, htmlContent: string, width: string = '650px') {
    return this.dialog.open(ConfirmationDialog, {
      width,
      data: {
        title,
        message: this.sanitizer.bypassSecurityTrustHtml(htmlContent)
      }
    });
  }

  openAlertDialog(title: string, message: string) {
    return this.dialog.open(ConfirmationDialog, {
      width: '400px',
      data: {
        title,
        message,
        showCancel: false,
        confirmText: 'OK'
      }
    });
  }
}
