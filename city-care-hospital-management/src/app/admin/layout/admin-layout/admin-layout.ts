import { Component } from '@angular/core';
import { RouterModule } from "@angular/router";
import { AdminSidebar } from '../../components/admin-sidebar/admin-sidebar';
import { AdminNavbar } from '../../components/admin-navbar/admin-navbar';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterModule, AdminSidebar, AdminNavbar],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  sidebarOpen: boolean = false;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }
}
