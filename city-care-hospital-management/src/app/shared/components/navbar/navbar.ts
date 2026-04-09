import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Button } from '../../ui/button/button';
import { SITE_CONFIG } from '../../../core/config/site.config';
import { AuthService } from '../../../core/services/auth.service';
import { MENU_ITEMS } from '../../../core/config/menu.config';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, Button],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  authService = inject(AuthService);
  site = SITE_CONFIG;
  menuItems = MENU_ITEMS;

  @Input() isOpen = false;
  @Output() toggle = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  trackByLabel(index: number, item: any) {
    return item.label;
  }
}
