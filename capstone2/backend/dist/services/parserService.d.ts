import { Medicine, PrescriptionData, Reminder } from '../types';
/**
 * Parse prescription text and extract structured data
 * @param rawText - Raw OCR text from prescription image
 * @returns Structured prescription data
 */
export declare const parsePrescription: (rawText: string) => PrescriptionData;
/**
 * Generate reminders from medicine list
 */
export declare const generateReminders: (medicines: Medicine[]) => Reminder[];
//# sourceMappingURL=parserService.d.ts.map