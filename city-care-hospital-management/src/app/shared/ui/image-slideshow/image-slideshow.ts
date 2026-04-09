import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-slideshow',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-slideshow.html',
  styleUrl: './image-slideshow.css'
})
export class ImageSlideshow implements OnInit, OnDestroy {
  images = [
    {
      url: '/assets/background.avif',
      alt: 'Hospital Building',
      title: 'Modern Medical Facility'
    },
    {
      url: '/assets/hospital-building.avif',
      alt: 'Hospital Infrastructure',
      title: 'State-of-the-Art Healthcare Center'
    },
    {
      url: '/assets/hospital-infrastructure-1.avif',
      alt: 'Advanced Medical Infrastructure',
      title: 'Advanced Medical Technology'
    },
    {
      url: '/assets/hospital-infrastructure-2.avif',
      alt: 'Medical Equipment',
      title: 'Cutting-Edge Medical Equipment'
    },
    {
      url: '/assets/trust-patient-image.avif',
      alt: 'Patient Care',
      title: 'Compassionate Patient Care'
    }
  ];

  currentImageIndex = 0;
  private intervalId: any;

  ngOnInit() {
    this.startSlideshow();
  }

  ngOnDestroy() {
    this.stopSlideshow();
  }

  startSlideshow() {
    this.intervalId = setInterval(() => {
      this.nextImage();
    }, 5000); // Change image every 5 seconds
  }

  stopSlideshow() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  nextImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
  }

  previousImage() {
    this.currentImageIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
  }

  goToImage(index: number) {
    this.currentImageIndex = index;
    this.stopSlideshow();
    this.startSlideshow(); // Restart slideshow after manual selection
  }

  get currentImage() {
    return this.images[this.currentImageIndex];
  }
}
