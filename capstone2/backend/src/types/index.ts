// Medicine interface representing a single medication entry
export interface Medicine {
  id: number;
  name: string;
  nameKhmer?: string;
  dosage: string;
  quantity: string;
  route: string;
  frequency: string;
  duration?: string;
  instructions?: string;
  schedule: MedicineSchedule[];
}

// Schedule for when to take medicine
export interface MedicineSchedule {
  time: string;      // e.g., "08:00"
  period: string;    // e.g., "morning", "afternoon", "evening", "night"
  withFood: boolean;
}

// Parsed prescription data
export interface PrescriptionData {
  patientName?: string;
  patientAge?: string;
  patientGender?: string;
  doctorName?: string;
  hospitalName?: string;
  date?: string;
  medicines: Medicine[];
  rawText?: string;
}

// Reminder data for Flutter app
export interface Reminder {
  medicineId: number;
  medicineName: string;
  dosage: string;
  scheduledTime: string;
  period: string;
  instructions: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface OcrResult {
  rawText: string;
  prescription: PrescriptionData;
  reminders: Reminder[];
}

// Multer file type extension
export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

