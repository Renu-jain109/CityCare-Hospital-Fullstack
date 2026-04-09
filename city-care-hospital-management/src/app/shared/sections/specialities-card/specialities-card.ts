import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Card } from '../../ui/card/card';

@Component({
  selector: 'app-specialities-card',
  imports: [CommonModule,Card ],
  templateUrl: './specialities-card.html',
  styleUrl: './specialities-card.css',
})
export class SpecialitiesCard {

  constructor(private router: Router){}

 @Input() icon?: string = '';
  @Input() title?: string = '';
  @Input() short?: string = '';
  @Input() cardId?: string = '';

openDepartment(slug?: string){
this.router.navigate(['/department', slug]);
}
}
