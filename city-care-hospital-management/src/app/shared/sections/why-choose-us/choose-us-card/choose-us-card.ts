import { Component } from '@angular/core';
import { Heading } from "../../../ui/heading/heading";
import { Card } from "../../../ui/card/card";
import { ChooseUsInterface } from '../../interfaces/choose-us-interface';

@Component({
  selector: 'app-choose-us-card',
  imports: [Heading, Card],
  templateUrl: './choose-us-card.html',
  styleUrl: './choose-us-card.css',
})
export class ChooseUsCard {
  public chooseUsCardData: ChooseUsInterface[] = [
    {
      iconClass: 'fas fa-user-md',
      title: 'Expert Doctors',
      description: "Experienced specialists with 15+ years in their field",
      bgColor: 'bg-blue-100',
      iconColor: 'text-primary'
    },
    {
      iconClass: 'fas fa-microscope',
      title: "Advanced Technology",
      description: "Latest medical equipment and digital health systems",
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      iconClass: 'fas fa-ambulance',
      title: '24×7 Emergency',
      description: "Round-the-clock emergency care with dedicated team",
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600'
    },
    {
      iconClass: 'fas fa-heart',
      title: 'Affordable Care',
      description: "Quality treatment at reasonable prices for everyone",
      bgColor: 'bg-blue-100',
      iconColor: 'text-light-blue'
    }
  ]
}
