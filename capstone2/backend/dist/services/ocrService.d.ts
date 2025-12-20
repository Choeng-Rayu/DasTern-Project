/**
 * Run OCR on prescription image
 * @param imagePath - Path to the image file
 * @returns Extracted text from the image
 */
export declare const runOCR: (imagePath: string) => Promise<string>;
/**
 * Run OCR with multiple attempts for better accuracy
 * @param imagePath - Path to the image file
 * @returns Best OCR result
 */
export declare const runOCRWithRetry: (imagePath: string) => Promise<string>;
//# sourceMappingURL=ocrService.d.ts.map