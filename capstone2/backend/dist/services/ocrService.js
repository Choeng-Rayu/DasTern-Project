"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runOCRWithRetry = exports.runOCR = void 0;
const tesseract_js_1 = __importDefault(require("tesseract.js"));
const preprocess_1 = require("../utils/preprocess");
/**
 * Run OCR on prescription image
 * @param imagePath - Path to the image file
 * @returns Extracted text from the image
 */
const runOCR = async (imagePath) => {
    try {
        // Step 1: Preprocess image for better OCR accuracy
        console.log('🔧 Preprocessing image...');
        const processedImage = await (0, preprocess_1.cleanImage)(imagePath);
        // Step 2: Run Tesseract OCR with English language support
        // Note: Khmer (khm) requires additional training data installation
        console.log('🔍 Running Tesseract OCR...');
        const { data: { text, confidence } } = await tesseract_js_1.default.recognize(processedImage, 'eng', // English language (add 'khm' if Khmer traineddata is installed)
        {
            logger: (m) => {
                if (m.status === 'recognizing text') {
                    console.log(`📊 OCR Progress: ${Math.round(m.progress * 100)}%`);
                }
            }
        });
        console.log(`✅ OCR completed with ${confidence}% confidence`);
        return text;
    }
    catch (error) {
        console.error('❌ OCR Service Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown OCR error';
        throw new Error(`OCR failed: ${errorMessage}`);
    }
};
exports.runOCR = runOCR;
/**
 * Run OCR with multiple attempts for better accuracy
 * @param imagePath - Path to the image file
 * @returns Best OCR result
 */
const runOCRWithRetry = async (imagePath) => {
    const results = [];
    try {
        // Attempt 1: Standard preprocessing
        const standardResult = await (0, exports.runOCR)(imagePath);
        results.push(standardResult);
        // Attempt 2: High contrast preprocessing
        const highContrastImage = await (0, preprocess_1.cleanImage)(imagePath, { highContrast: true });
        const { data: { text: hcText } } = await tesseract_js_1.default.recognize(highContrastImage, 'eng');
        results.push(hcText);
        // Return the result with more text (likely better recognition)
        return results.reduce((a, b) => a.length > b.length ? a : b);
    }
    catch (error) {
        if (results.length > 0) {
            return results[0];
        }
        throw error;
    }
};
exports.runOCRWithRetry = runOCRWithRetry;
//# sourceMappingURL=ocrService.js.map