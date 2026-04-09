import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CardInterface } from '../interfaces/card-interface';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {

 @Input() cardData: CardInterface = {};

  // Default Value (central place)
  @Input() defaultcardConfig: CardInterface = {
    bgColor: 'bg-white',
    customClass: '',
    iconClass: '',
    iconSize: 'text-4xl',
    showIconCircle: false,
    titleClass: 'text-xl lg:text-xl sm:text-lg font-bold mb-2',
    descriptionClass: '',
    hoverClass: 'hover:shadow-xl transition',
    department: '',
    deparmentClass: '',
    experience: '',
    experienceClass: '',
    qualification: '',
    qualificationClass: '',
    availability: '',
    availabilityClass: '',
    imageSrc: '',
    imageClass: '',
    fallbackText: '',
    fallbackBg: '#0055aa',

  }

  // Final cardConfig (merged)
  get finalcardConfig(): CardInterface {
    return {
      ...this.defaultcardConfig,
      ...this.cardData
    };
  }

}
