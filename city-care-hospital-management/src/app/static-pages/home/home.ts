import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Heading } from "../../shared/ui/heading/heading";
import { Router } from '@angular/router';
import { Button } from "../../shared/ui/button/button";
import { TestimonialsBlock } from '../../shared/sections/testimonials/testimonials-block/testimonials-block';
import { ChooseUsCard } from '../../shared/sections/why-choose-us/choose-us-card/choose-us-card';
import { SpecialitiesCard } from '../../shared/sections/specialities-card/specialities-card';
import { DepartmentService } from '../../core/services/department-service';
import { DepartmentInterface } from '../../core/interfaces/department-interface';
import { ActionCard } from '../../shared/sections/action-card/action-card';
import { ImageSlideshow } from '../../shared/ui/image-slideshow/image-slideshow';

@Component({
  selector: 'app-home',
  imports: [CommonModule, TestimonialsBlock, ChooseUsCard, ActionCard, Heading, SpecialitiesCard, Button, ImageSlideshow],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {

  constructor(public router: Router) { }
  departmentService = inject(DepartmentService)
  // departments: DepartmentInterface[] = this.departmentService.getAllDepartmentsFromBackend().subscribe(data => data);
  departments: DepartmentInterface[] = [];

  mobileMenu = false;
  displayCount = 10;


  ngOnInit(): void {
    this.departmentService.getAllDepartmentsFromBackend().subscribe(data => {
      this.departments = data;
    });
    this.updateCount();
  }

  toggleMobileMenu() {
    this.mobileMenu = !this.mobileMenu;
  }

  updateCount() {
    if (window.innerWidth < 640) {
      this.displayCount = 4;
    } else if (window.innerWidth < 768) {
      this.displayCount = 6;
    } else if (window.innerWidth < 1024) {
      this.displayCount = 6;
    } else {
      this.displayCount = 10;
    }
  }


  showMore() {
    this.router.navigate(['/department']);
  }

  navigateToDepartment(slug: string | undefined) {
    if(!slug) return;
    this.router.navigate(['/department-details', slug]);
  }

}
