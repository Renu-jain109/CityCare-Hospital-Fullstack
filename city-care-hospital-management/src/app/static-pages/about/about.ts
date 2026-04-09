import { AfterViewInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Heading } from '../../shared/ui/heading/heading';
import { Card } from '../../shared/ui/card/card';
import { TestimonialsBlock } from '../../shared/sections/testimonials/testimonials-block/testimonials-block';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, Heading, Card, TestimonialsBlock],
  templateUrl: './about.html',
  styles: ``
})
export class AboutUs implements AfterViewInit {

   constructor(private route: ActivatedRoute) {}

  ngAfterViewInit() {
    // this.route.fragment.subscribe(fragment => {
    //   if (fragment) {
    //     setTimeout(() => {
    //       const element = document.getElementById(fragment);
    //       if (element) {
    //         const yOffset = -100; // 👈 adjust based on navbar height
    //         const y = element.getBoundingClientRect().top + window.scrollY + yOffset;

    //         window.scrollTo({ top: y, behavior: 'smooth' });
    //       }
    //     }, 100);
    //   }
    // });
  }

}
