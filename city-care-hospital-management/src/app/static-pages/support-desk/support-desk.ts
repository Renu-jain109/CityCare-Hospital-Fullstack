import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Heading } from '../../shared/ui/heading/heading';
import { Card } from '../../shared/ui/card/card';

@Component({
  selector: 'app-support-desk',
  standalone: true,
  imports: [CommonModule, Heading, Card],
  templateUrl: './support-desk.html',
  styles: ``
})
export class SupportDesk {
  contactMethods = [
    { icon: 'fas fa-phone-alt', title: 'Call Support', desc: '+91 1800-CITY-CARE', action: 'Call Now' },
    { icon: 'fas fa-envelope', title: 'Email Us', desc: 'support@citycarehospital.com', action: 'Send Email' },
    { icon: 'fas fa-comments', title: 'Live Chat', desc: 'Available 9AM - 6PM', action: 'Chat Now' },
    { icon: 'fas fa-map-marker-alt', title: 'Visit Us', desc: '123 Medical Square, Main City', action: 'Get Directions' }
  ];

  recentTickets = [
    { id: 'TKT-7721', subject: 'Billing Query', status: 'In Progress', date: 'Oct 28, 2026' },
    { id: 'TKT-6540', subject: 'Lab Report Missing', status: 'Resolved', date: 'Oct 15, 2026' }
  ];
}
