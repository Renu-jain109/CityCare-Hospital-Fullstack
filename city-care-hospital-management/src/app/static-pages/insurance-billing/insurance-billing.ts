import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Heading } from '../../shared/ui/heading/heading';
import { Card } from '../../shared/ui/card/card';

@Component({
  selector: 'app-insurance-billing',
  standalone: true,
  imports: [CommonModule, Heading, Card],
  templateUrl: './insurance-billing.html',
})
export class InsuranceAndBilling {
  insurancePartners = [
    { title: 'Star Health', fallbackText: 'SH', fallbackBg: '#0055aa', imageSrc: 'https://logo.clearbit.com/starhealth.in' },
    { title: 'HDFC ERGO', fallbackText: 'HE', fallbackBg: '#da251c', imageSrc: 'https://logo.clearbit.com/hdfcergo.com' },
    { title: 'Religare', fallbackText: 'RE', fallbackBg: '#008444', imageSrc: 'https://logo.clearbit.com/religare.com' },
    { title: 'ICICI Lombard', fallbackText: 'IL', fallbackBg: '#f58220', imageSrc: 'https://logo.clearbit.com/icicilombard.com' },
    { title: 'Niva Bupa', fallbackText: 'NB', fallbackBg: '#00aeef', imageSrc: 'https://logo.clearbit.com/nivabupa.com' },
    { title: 'Care Health', fallbackText: 'CH', fallbackBg: '#4a90e2', imageSrc: 'https://logo.clearbit.com/careinsurance.com' }
  ];

  faqs = [
    {
      q: 'How do I start the cashless process?',
      a: 'Visit our TPA (Third Party Administrator) desk at the entrance with your insurance card and valid ID proof. Our team will handle the pre-authorization.'
    },
    {
      q: 'Is a deposit required even with insurance?',
      a: 'A nominal security deposit may be required during admission, which is refundable upon clearance of the final bill by the insurance company.'
    },
    {
      q: 'What if my insurance is not on the panel?',
      a: 'We support reimbursement for all major insurance companies. You can pay the bills and we will provide all necessary documentation for your claim.'
    }
  ];
}
