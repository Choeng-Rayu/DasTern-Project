import { Request, Response } from 'express';
import { runOCRWithMetrics, OcrMetrics } from '../services/ocrService';
import { parsePrescription, generateReminders } from '../services/parserService';
import { ApiResponse, OcrResult } from '../types';

// Extended OCR result with accuracy metrics
interface OcrResultWithMetrics extends OcrResult {
  accuracy: {
    confidence: number;
    languages: string;
    processingTimeMs: number;
    characterCount: number;
  };
}

/**
 * Scan prescription image and extract structured data
 */
export const scanPrescription = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      } as ApiResponse<null>);
      return;
    }

    const filePath = req.file.path;
    console.log(`📸 Processing image: ${filePath}`);

    // Step 1: Run OCR on the image with metrics
    const ocrResult: OcrMetrics = await runOCRWithMetrics(filePath);

    // Step 2: Parse and structure the prescription text
    const prescription = parsePrescription(ocrResult.text);

    // Step 3: Generate reminder schedule
    const reminders = generateReminders(prescription.medicines);

    const response: ApiResponse<OcrResultWithMetrics> = {
      success: true,
      data: {
        rawText: ocrResult.text,
        prescription: prescription,
        reminders: reminders,
        accuracy: {
          confidence: Math.round(ocrResult.confidence * 100) / 100,
          languages: ocrResult.languages,
          processingTimeMs: ocrResult.processingTime,
          characterCount: ocrResult.characterCount
        }
      }
    };

    res.json(response);

  } catch (error) {
    console.error('❌ OCR Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process prescription image';
    res.status(500).json({
      success: false,
      message: errorMessage
    } as ApiResponse<null>);
  }
};

/**
 * Parse raw text directly (for testing)
 */
export const parseRawText = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text } = req.body;

    if (!text) {
      res.status(400).json({
        success: false,
        message: 'No text provided'
      } as ApiResponse<null>);
      return;
    }

    const prescription = parsePrescription(text);
    const reminders = generateReminders(prescription.medicines);

    const response: ApiResponse<OcrResult> = {
      success: true,
      data: {
        rawText: text,
        prescription: prescription,
        reminders: reminders
      }
    };

    res.json(response);

  } catch (error) {
    console.error('❌ Parse Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to parse text';
    res.status(500).json({
      success: false,
      message: errorMessage
    } as ApiResponse<null>);
  }
};

