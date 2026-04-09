export interface ActionCardInterface {
    iconClass: string;     // 'fas fa-calendar-check'
    title: string;         // 'Book Appointment'
    description: string;   // 'Instant slot booking...'
    routerLink: string;    // '/appointment' or 'tel:108'
    buttonText: string;    // 'Book Now →'
    bgColor: string;       // 'bg-appointmentBlue'
    textColor: string;     // 'text-appointmentBlue'
    isTelLink?: boolean;
}
