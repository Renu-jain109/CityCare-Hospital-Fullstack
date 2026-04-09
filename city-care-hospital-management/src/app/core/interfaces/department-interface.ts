export interface DepartmentInterface {

    departmentId: string;
    departmentName?: string;
    slug?: string;

    icon?: string;
    image?: string;
    bannerImage?: string;

    short?: string;
    subtitle?: string;
    description?: string;

    treatments?: string[];
    numberOfDoctors?: number;

    // doctor connection
    doctorId?: string[];

    // FAQs for department page
    faqs?: { q: string; a: string }[];

    // admin-only optional fields
    headOfDepartment?: string;
    status?: 'Active' | 'Inactive';
}
