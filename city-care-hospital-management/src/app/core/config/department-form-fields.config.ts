import { DynamicFormInterface } from "../../shared/ui/interfaces/dynamic-form-interface";

export const DEPARTMENT_FORM_FIELDS: DynamicFormInterface[] = [
  // Step 1: Basic Info (Mandatory)
  { key: 'departmentName', label: 'Department Name', type: 'text', placeholder: 'e.g., Cardiology', required: true },
  { key: 'headOfDepartment', label: 'Head of Department', type: 'text', placeholder: 'e.g., Dr. Smith', required: true },
  { key: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }], required: true },
  
  // Step 2: Details (Optional)
  { key: 'slug', label: 'Slug', type: 'text', placeholder: 'e.g., cardiology', required: false },
  { key: 'icon', label: 'Icon Class', type: 'text', placeholder: 'e.g., fas fa-heart', required: false },
  { key: 'short', label: 'Short Tagline', type: 'text', placeholder: 'e.g., Heart Care Specialists', required: false },
  { key: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'e.g., Advanced cardiac care', required: false },
  { key: 'bannerImage', label: 'Banner Image URL', type: 'text', placeholder: '/assets/images/cardiology-banner.jpg', required: false },
  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Detailed description of department...', required: false },
  
  // Step 3: Medical Info (Optional)
  { key: 'treatments', label: 'Treatments', type: 'textarea', placeholder: 'Enter treatments separated by commas', required: false },
  { key: 'faqs', label: 'FAQs', type: 'textarea', placeholder: 'Question1?Answer1||Question2?Answer2', required: false },
  { key: 'doctorIds', label: 'Linked Doctor IDs', type: 'textarea', placeholder: 'Enter doctor IDs separated by commas', required: false }
];

// Validation function for department form
export const validateDepartmentForm = (formData: any, existingDepartments: any[]) => {
  const errors: string[] = [];
  
  // Check if department name already exists
  const nameExists = existingDepartments.some(dept => 
    dept.departmentName?.toLowerCase() === formData.departmentName?.toLowerCase()
  );
  
  if (nameExists) {
    errors.push('Department with this name already exists');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};