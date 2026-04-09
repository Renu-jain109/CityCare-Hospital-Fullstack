import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Heading } from '../../shared/ui/heading/heading';
import { Card } from '../../shared/ui/card/card';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, Heading, Card],
  templateUrl: './services.html',
  styles: ``
})
export class Services {

  servicesData = [
    { title: 'Emergency Care', text: '24/7 trauma care and immediate attention.', icon: 'fas fa-ambulance' },
    { title: 'Online Medicine', text: 'Order medicines and get them delivered home.', icon: 'fas fa-pills' },
    { title: 'Maternity & Child Care', text: 'Advanced care for mothers and infants.', icon: 'fas fa-baby' },
    { title: 'Diagnostic Labs', text: 'Cutting-edge digital pathology and imaging.', icon: 'fas fa-microscope' },
    { title: 'Speciality Treatments', text: 'Oncology, Neurology, and Cardiac procedures.', icon: 'fas fa-heartbeat' },
    { title: 'Health Checks', text: 'Master health checkups and preventative care.', icon: 'fas fa-stethoscope' }
  ];

}
