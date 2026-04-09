import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [CommonModule],
  templateUrl: './button.html',
  // styleUrl: './button.css',
})
export class Button {
  @Input() label: string = '';
  @Input() color: 'primary' | 'secondary' | 'danger' | 'light-blue' |'outline' | 'bg-white' = 'primary';
  @Input() icon: string = '';


  @Input() customClass: string = 'rounded-xl';

  // important for forms & reusable usage
  @Input() type : 'button' | 'submit' = 'button';

  // 👇 parent ko click event bhejne ke liye
  @Output() clicked = new EventEmitter<void>();

  @Input() disabled: boolean = false;

  onClick() {
    this.clicked.emit();
  }
}
