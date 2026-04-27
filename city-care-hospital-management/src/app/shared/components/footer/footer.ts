import { Component } from '@angular/core';
import { SITE_CONFIG } from '../../../core/config/site.config';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {

  site = SITE_CONFIG;
  phone = SITE_CONFIG.phone;
  email = SITE_CONFIG.email;

}
