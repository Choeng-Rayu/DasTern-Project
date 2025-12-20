"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRawText = exports.scanPrescription = void 0;
const ocrService_1 = require("../services/ocrService");
const parserService_1 = require("../services/parserService");
/**
 * Scan prescription image and extract structured data
 */
const scanPrescription = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: 'No image file uploaded'
            });
            return;
        }
        const filePath = req.file.path;
        console.log(`📸 Processing image: ${filePath}`);
        // Step 1: Run OCR on the image
        const rawText = await (0, ocrService_1.runOCR)(filePath);
        console.log('📝 Raw OCR text:', rawText);
        // Step 2: Parse and structure the prescription text
        const prescription = (0, parserService_1.parsePrescription)(rawText);
        // Step 3: Generate reminder schedule
        const reminders = (0, parserService_1.generateReminders)(prescription.medicines);
        const response = {
            success: true,
            data: {
                rawText: rawText,
                prescription: prescription,
                reminders: reminders
            }
        };
        res.json(response);
    }
    catch (error) {
        console.error('❌ OCR Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to process prescription image';
        res.status(500).json({
            success: false,
            message: errorMessage
        });
    }
};
exports.scanPrescription = scanPrescription;
/**
 * Parse raw text directly (for testing)
 */
const parseRawText = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            res.status(400).json({
                success: false,
                message: 'No text provided'
            });
            return;
        }
        const prescription = (0, parserService_1.parsePrescription)(text);
        const reminders = (0, parserService_1.generateReminders)(prescription.medicines);
        const response = {
            success: true,
            data: {
                rawText: text,
                prescription: prescription,
                reminders: reminders
            }
        };
        res.json(response);
    }
    catch (error) {
        console.error('❌ Parse Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to parse text';
        res.status(500).json({
            success: false,
            message: errorMessage
        });
    }
};
exports.parseRawText = parseRawText;
//# sourceMappingURL=ocrController.js.map