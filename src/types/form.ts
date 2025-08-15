export interface FormData {
  // Step 1: Personal Information
  consultantName: string;
  patientName: string;
  phoneNumber: string;
  patientId: string;
  entryDate: string;
  age: number | "";
  currency: string;
  language: string;
  healthCondition: string;
  services: string;

  // Step 2: Medical Visit
  firstVisit: {
    visitDate: string;
    visitDays: number | "";
    serviceEntries: ServiceEntry[];
  };
  secondVisit: {
    visitDate: string;
    visitDays: number | "";
    serviceEntries: ServiceEntry[];
  };

  // Step 3: Notes
  uploadedImages: File[];
  externalLink: string;
  medicalTreatmentPlan?: string;
  medicalNotes?: string;
  pdfLanguage?: string;
}

export interface ServiceEntry {
  id: string;
  serviceName: string;
  serviceType: string;
  price: number | "";
  quantity: number | "";
}

export interface FormErrors {
  [key: string]: string;
}

export interface StepProps {
  formData: FormData;
  errors: FormErrors;
  onChange: (field: keyof FormData, value: string | number | File[]) => void;
  onBlur: (field: keyof FormData) => void;
  onValidate: () => boolean;
}
