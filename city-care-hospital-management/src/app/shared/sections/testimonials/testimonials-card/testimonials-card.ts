import { Component, Input } from '@angular/core';
import { TestimonialsCardInterface } from '../../interfaces/testimonials-card-interface';

@Component({
  selector: 'app-testimonials-card',
  imports: [],
  templateUrl: './testimonials-card.html',
  styleUrl: './testimonials-card.css',
})
export class TestimonialsCard {
@Input() testimonialCardData! : TestimonialsCardInterface;
}
