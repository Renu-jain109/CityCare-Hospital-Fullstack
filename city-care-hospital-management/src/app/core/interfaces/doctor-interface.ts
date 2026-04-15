export interface DoctorInterface {
    doctorId: string;
    doctorName: string;
    mobile: string;
    email: string;
    slug?: string;

    // used to connect with departments
    departmentName: string;

    experience: string;
    qualification?: string;
    specialization?: string;

    icon?: string;
    image?: string;

    availability?: string;

    consultationFee?: number;
    status: 'Active' | 'Inactive';
    about?: string;
}
