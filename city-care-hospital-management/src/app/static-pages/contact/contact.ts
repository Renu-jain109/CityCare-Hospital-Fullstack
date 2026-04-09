import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Heading } from '../../shared/ui/heading/heading';
import { Button } from '../../shared/ui/button/button';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, Heading, Button],
  templateUrl: './contact.html',
  styles: ``
})
export class Contact {

}
