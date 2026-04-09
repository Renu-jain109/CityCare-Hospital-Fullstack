import { MenuItem } from '../interfaces/menu-item.interface';

export const MENU_ITEMS: MenuItem[] = [
  {
    label: 'Home',
    route: '/'
  },
  {
    label: 'About Us',
    route: '/about',
    children: [
      { label: 'Our Story / Mission', route: '/about', fragment: 'story' },
      { label: 'Vision & Values', route: '/about', fragment: 'vision' },
      { label: 'Management Team', route: '/about', fragment: 'management' },
      { label: 'Hospital Infrastructure', route: '/about', fragment: 'infrastructure' },
      { label: 'Testimonials', route: '/about', fragment: 'testimonials' }
    ]
  },
  {
    label: 'Services',
    route: '/services',
    children: [
      { label: 'Emergency Services', route: '/emergency' },
      { label: 'Pharmacy Services', route: '/order-medicine' },
      { label: 'Insurance & Billing Support', route: '/insurance-billing' },
      { label: 'Specialized Treatments (Cardiology, Ophthalmology, etc.)', route: '/department' }
    ]
  },
  {
    label: 'Doctors',
    route: '/doctor-list',
    children: [
      { label: 'All Doctors List', route: '/doctor-list' },
      { label: 'By Department', route: '/department' },
      { label: 'Book Appointment with Doctor', route: '/book-appointment' }
    ]
  },
  {
    label: 'Departments',
    route: '/department',
    children: [
      { label: 'Cardiology', route: '/department-details/cardiology' },
      { label: 'Ophthalmology', route: '/department-details/ophthalmology' },
      { label: 'Physiotherapy', route: '/department-details/physiotherapy' },
      { label: 'Neurology', route: '/department-details/neurology' },
      { label: 'Pediatrics', route: '/department-details/pediatrics' },
      { label: 'General Medicine', route: '/department-details/general-medicine' }
    ]
  },
  {
    label: 'Appointment',
    route: '/book-appointment',
    children: [
      { label: 'Book Appointment (patient form)', route: '/book-appointment' },
      { label: 'My Appointments (for registered users)', route: '/my-appointments' },
      { label: 'Appointment Guidelines', route: '/appointment-guidelines' }
    ]
  },
  {
    label: 'Contact',
    route: '/contact',
    children: [
      { label: 'Contact Details', route: '/contact' },
      { label: 'Support Desk', route: '/support-desk' }
    ]
  },
  {
    label: 'Pharmacy',
    route: '/order-medicine',
    children: [
      { label: 'Browse Medicines', route: '/order-medicine' },
      { label: 'Order History', route: '/order-history' }
    ]
  }
];
