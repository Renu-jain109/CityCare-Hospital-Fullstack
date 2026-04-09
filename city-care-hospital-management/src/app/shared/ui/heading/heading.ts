import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-heading',
  imports: [CommonModule],
  templateUrl: './heading.html',
  styleUrl: './heading.css',
})
export class Heading {
  @Input() title: string = "";
  @Input() subtitle: string = "";

  // base size (used as default)
  @Input() size: 'xl' | 'lg' | 'md' | 'sm' = 'md';

  // responsive overrides (optional)
  @Input() sizeSm: 'xl' | 'lg' | 'md' | 'sm' | '' = '';
  @Input() sizeMd: 'xl' | 'lg' | 'md' | 'sm' | '' = '';
  @Input() sizeLg: 'xl' | 'lg' | 'md' | 'sm' | '' = '';
  @Input() sizeXl: 'xl' | 'lg' | 'md' | 'sm' | '' = '';

  // alignment: left, center, right
  @Input() align: 'left' | 'center' | 'right' = 'left';

  // highlighted text
  @Input() highlight: string = '';

  // <- highlight ka color class
  @Input() highlightClass: string = '';


  // add extra class 
  @Input() class: string = '';

}
