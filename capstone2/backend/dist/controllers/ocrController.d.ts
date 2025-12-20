import { Request, Response } from 'express';
/**
 * Scan prescription image and extract structured data
 */
export declare const scanPrescription: (req: Request, res: Response) => Promise<void>;
/**
 * Parse raw text directly (for testing)
 */
export declare const parseRawText: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=ocrController.d.ts.map