import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Heading } from '../../shared/ui/heading/heading';
import { Card } from '../../shared/ui/card/card';

@Component({
  selector: 'app-appointment-guidelines',
  standalone: true,
  imports: [CommonModule, Heading, Card],
  templateUrl: './appointment-guidelines.html',
  styles: ``
})
export class AppointmentGuidelines {
  guidelines = [
    { icon: 'fas fa-id-card', title: 'Bring Valid ID', desc: 'Please carry a government-issued photo ID and your insurance card for every visit.' },
    { icon: 'fas fa-clock', title: 'Arrival Time', desc: 'Arrive at least 15 minutes prior to your scheduled time to complete the check-in process.' },
    { icon: 'fas fa-notes-medical', title: 'Medical Records', desc: 'Carry all previous prescriptions, lab reports, and imaging documents relevant to your consultation.' },
    { icon: 'fas fa-ban', title: 'Cancellation', desc: 'Cancellations must be made at least 2 hours in advance to avoid a "No Show" fee.' }
  ];
}
