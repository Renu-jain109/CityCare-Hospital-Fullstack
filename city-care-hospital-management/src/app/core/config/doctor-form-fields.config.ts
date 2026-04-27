import { DynamicFormInterface } from "../../shared/ui/interfaces/dynamic-form-interface";

export const DOCTOR_FORM_FIELDS: DynamicFormInterface[] = [
    { key: 'doctorName', label: 'Doctor Name', type: 'text', placeholder: 'Doctor Name', required: true },
    { key: 'departmentId', label: 'Department ID', type: 'text', placeholder: 'Department ID', hidden: true, required: true },
    { key: 'departmentName', label: 'Department', type: 'select', options: [], placeholder: 'Select Department', required: true },
    { key: 'email', label: 'Email', placeholder: 'Email', type: 'text', required: true },
    { key: 'specialization', label: 'Specialization', placeholder: 'Specialization', type: 'text', required: true },
    { key: 'experience', label: 'Experience (Years)', type: 'text', placeholder: 'Experience', required: true },
    { key: 'consultationFee', label: 'Consultation Fee', type: 'number', placeholder: 'Consultation Fee', required: true },
    { key: 'mobile', label: 'Mobile', placeholder: 'Mobile', type: 'text', required: true },
    { key: 'qualification', label: 'Qualification', placeholder: 'Qualification', type: 'text', required: true },
    { key: 'availability', label: 'Availability', placeholder: 'Availability', type: 'text', required: true },
    { key: 'status', label: 'status', type: 'select', options: [{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }], required: true }
];