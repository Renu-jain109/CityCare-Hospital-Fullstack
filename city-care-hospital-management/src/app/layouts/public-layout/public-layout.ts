import { Component, HostListener, inject } from '@angular/core';
import { Navbar } from "../../shared/components/navbar/navbar";
import { RouterOutlet } from "@angular/router";
import { Footer } from "../../shared/components/footer/footer";
import { LayoutService } from "../../core/services/layout.service";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-public-layout',
  imports: [Navbar, RouterOutlet, Footer, CommonModule],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.css',
})
export class PublicLayout {
navbarOpen : boolean = false;
layoutService = inject(LayoutService);

closeNavbar(){
  this.navbarOpen = false;
}

@HostListener('window:resize', [])
onResize() {
  if(window.innerWidth >= 1024) { // Tailwind lg breakpoint
    this.navbarOpen = false;
  }
}
}
