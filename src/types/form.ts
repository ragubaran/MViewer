export type FieldType =
  // Text & Input
  | 'text'
  | 'email'
  | 'phone'
  | 'url'
  | 'number'
  | 'currency'
  | 'textarea'
  // Choices & Selection
  | 'choice'
  | 'select'
  | 'yesno'
  // Ratings & Scales
  | 'rating'
  | 'scale'
  | 'slider'
  // Dates
  | 'date'
  // Legal & Security
  | 'legal'
  | 'signature'
  // File
  | 'file';

export interface FormFieldConfig {
  id: string;
  type: FieldType;
  label?: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  // Choice & Select options
  options?: string[];
  multiple?: boolean;
  style?: 'chips' | 'radio' | 'checkbox';
  // Numeric, slider, rating, scale
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  prefix?: string;
  suffix?: string;
  lowLabel?: string;
  highLabel?: string;
  icon?: 'star' | 'heart' | 'thumb';
  // Textarea
  rows?: number;
  // File
  accept?: string;
}

export type FormDataValue = 
  | string 
  | number 
  | boolean 
  | string[] 
  | { name: string; size?: number; type?: string; data?: string }
  | null;

export type FormDataRecord = Record<string, FormDataValue>;

export interface FormMetadata {
  title?: string;
  version?: string;
  template_id?: string;
  created_at?: string;
  updated_at?: string;
  author?: string;
  description?: string;
  template_checksum?: string;
  status?: 'draft' | 'template' | 'filled';
  tags?: string[];
  [key: string]: unknown;
}

export type VerificationStatus = 'verified' | 'tampered' | 'unsealed' | 'draft';

export interface IntegrityVerification {
  status: VerificationStatus;
  isValid: boolean;
  computedHash: string;
  expectedHash?: string;
  timestamp: string;
  message: string;
}

export interface FormDocument {
  metadata: FormMetadata;
  templateBody: string;
  formData: FormDataRecord;
  fields: FormFieldConfig[];
  verification: IntegrityVerification;
}
