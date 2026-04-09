import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from '../../ui/card/card';
import { RouterLink } from '@angular/router';
import { ActionCardInterface } from '../interfaces/action-card-interface';

@Component({
  selector: 'app-action-card',
  imports: [CommonModule, Card, RouterLink],
  templateUrl: './action-card.html',
  styleUrl: './action-card.css',
})
export class ActionCard {

  public actionCardData: ActionCardInterface[] = [
    {
      iconClass: 'fas fa-calendar-check',
      title: 'Book Appointment',
      description: 'Choose a doctor and book your slot quickly.',
      routerLink: '/book-appointment',
      buttonText: 'Book Now →',
      bgColor: 'bg-appointment-blue',
      textColor: 'text-appointment-blue',
      isTelLink: false,

    },
    {
      iconClass: 'fas fa-pills',
      title: 'Order Medicine',
      description: 'Upload prescription → Home delivery in 2 hours.',
      routerLink: '/order-medicine',
      buttonText: 'Order Now →',
      bgColor: 'bg-medicine-green',
      textColor: 'text-medicine-green',
      
    },
    {
      iconClass: 'fas fa-user-md',
      title: 'Find a Doctor',
      description: 'Search specialists and book consultation instantly.',
      routerLink: '/doctor-list',
      buttonText: 'Search Now →',
      bgColor: 'bg-doctor-sky-blue',
      textColor: 'text-doctor-sky-blue',
    },
    {
      iconClass: 'fas fa-ambulance',
      title: '24×7 Emergency',
      description: 'Urgent Medical Assistance Available Instantly.',
      routerLink: '/emergency',
      buttonText: 'Call 108 Now →',
      bgColor: 'bg-emergency-red',
      textColor: 'text-emergency-red',
      isTelLink: false,
    }
  ];

}
