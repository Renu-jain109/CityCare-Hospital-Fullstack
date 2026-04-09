export interface ButtonInterface {
    label: string;
    color: 'primary' | 'secondary' | 'danger' | 'light-blue' | 'outline' | 'bg-white';
    icon: string;
    type: 'submit' | 'button';
    // align: 'left' | 'center' | 'right';
    customClass: string;
    onClick?: () => void;
}
