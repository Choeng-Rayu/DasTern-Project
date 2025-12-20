interface PreprocessOptions {
    highContrast?: boolean;
}
/**
 * Preprocess image for better OCR accuracy
 * @param imagePath - Path to the original image
 * @param options - Preprocessing options
 * @returns Path to the processed image
 */
export declare const cleanImage: (imagePath: string, options?: PreprocessOptions) => Promise<string>;
/**
 * Deskew image if it's rotated
 * @param imagePath - Path to the image
 * @returns Path to the deskewed image
 */
export declare const deskewImage: (imagePath: string) => Promise<string>;
export {};
//# sourceMappingURL=preprocess.d.ts.map