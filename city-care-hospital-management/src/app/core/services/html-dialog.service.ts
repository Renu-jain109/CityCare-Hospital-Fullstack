import { Injectable } from '@angular/core';

export interface HtmlDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  width?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HtmlDialogService {
  showDialog(data: HtmlDialogData): Promise<boolean> {
    return new Promise((resolve) => {
      // Create modal overlay
      const modalOverlay = document.createElement('div');
      modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      `;

      // Create modal content
      const modalContent = document.createElement('div');
      modalContent.style.cssText = `
        background: white;
        border-radius: 12px;
        max-width: ${data.width || '600px'};
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      `;

      modalContent.innerHTML = `
        <div style="background: #1e40af; color: white; padding: 20px; border-radius: 12px 12px 0 0;">
          <h2 style="margin: 0; font-size: 20px;">${data.title}</h2>
        </div>
        <div style="padding: 20px;">
          ${data.message}
        </div>
        <div style="padding: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 10px;">
          ${data.showCancel !== false ? `
            <button id="cancelBtn" style="
              padding: 10px 20px;
              border: 1px solid #d1d5db;
              background: white;
              color: #374151;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
            ">${data.cancelText || 'Cancel'}</button>
          ` : ''}
          <button id="confirmBtn" style="
            padding: 10px 20px;
            background: #1e40af;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
          ">${data.confirmText || 'Confirm'}</button>
        </div>
      `;

      modalOverlay.appendChild(modalContent);
      document.body.appendChild(modalOverlay);

      // Add event listeners
      const confirmBtn = modalContent.querySelector('#confirmBtn');
      const cancelBtn = modalContent.querySelector('#cancelBtn');

      const closeModal = (result: boolean) => {
        document.body.removeChild(modalOverlay);
        resolve(result);
      };

      confirmBtn?.addEventListener('click', () => closeModal(true));
      cancelBtn?.addEventListener('click', () => closeModal(false));

      // Close on overlay click
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          closeModal(false);
        }
      });

      // Close on escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeModal(false);
          document.removeEventListener('keydown', handleEscape);
        }
      };
      document.addEventListener('keydown', handleEscape);
    });
  }
}
