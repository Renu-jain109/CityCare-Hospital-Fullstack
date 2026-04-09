export interface DynamicFormInterface {
    key: string;    // form control name
    label: string;
    type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'hidden';
    required: boolean;
    placeholder?: string;
    colSpan?: number;
    options?: { label: string; value: any; disabled?: boolean }[];
    rows?: number; // for textarea
    value?: any; // for pre-filling in edit mode
    readonly?: boolean; // for read-only fields
}
