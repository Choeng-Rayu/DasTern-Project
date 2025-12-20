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
export interface MedicineSchedule {
    time: string;
    period: string;
    withFood: boolean;
}
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
export interface Reminder {
    medicineId: number;
    medicineName: string;
    dosage: string;
    scheduledTime: string;
    period: string;
    instructions: string;
}
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
//# sourceMappingURL=index.d.ts.map