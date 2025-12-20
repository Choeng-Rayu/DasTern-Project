import Tesseract from 'tesseract.js';
import { cleanImage } from '../utils/preprocess';
import fs from 'fs';

// OCR Result with accuracy metrics
export interface OcrMetrics {
  text: string;
  confidence: number;
  languages: string;
  processingTime: number;
  characterCount: number;
}

/**
 * Run OCR on prescription image with both Khmer and English support
 * @param imagePath - Path to the image file
 * @returns Extracted text from the image
 */
export const runOCR = async (imagePath: string): Promise<string> => {
  const result = await runOCRWithMetrics(imagePath);
  return result.text;
};

/**
 * Run OCR with detailed metrics for accuracy reporting
 * @param imagePath - Path to the image file
 * @returns OCR result with metrics
 */
export const runOCRWithMetrics = async (imagePath: string): Promise<OcrMetrics> => {
  const startTime = Date.now();

  try {
    // Verify file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }

    console.log(`📁 Processing file: ${imagePath}`);

    // Step 1: Preprocess image for better OCR accuracy
    console.log('🔧 Preprocessing image...');
    let processedImage: string;
    try {
      processedImage = await cleanImage(imagePath);
    } catch (preprocessError) {
      console.warn('⚠️ Preprocessing failed, using original image:', preprocessError);
      processedImage = imagePath;
    }

    // Step 2: Run Tesseract OCR with Khmer + English
    // Tesseract.js will automatically download language data
    console.log('🔍 Running Tesseract OCR with Khmer + English...');
    console.log('📥 Downloading language data (first time may take a moment)...');

    const worker = await Tesseract.createWorker('khm+eng', 1, {
      logger: (m: Tesseract.LoggerMessage) => {
        if (m.status === 'loading language traineddata') {
          console.log(`📥 Loading ${m.progress < 1 ? 'Khmer' : 'English'} language data...`);
        } else if (m.status === 'recognizing text') {
          console.log(`📊 OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });

    const { data } = await worker.recognize(processedImage);

    await worker.terminate();

    const processingTime = Date.now() - startTime;

    console.log('\n═══════════════════════════════════════════');
    console.log('📊 OCR ACCURACY REPORT');
    console.log('═══════════════════════════════════════════');
    console.log(`🌏 Languages: Khmer (ខ្មែរ) + English`);
    console.log(`📈 Confidence: ${Math.round(data.confidence)}%`);
    console.log(`📝 Characters extracted: ${data.text.length}`);
    console.log(`⏱️ Processing time: ${processingTime}ms`);
    console.log(`📄 Words detected: ${data.words?.length || 0}`);
    console.log('═══════════════════════════════════════════\n');

    // Log the extracted text
    console.log('📜 EXTRACTED TEXT:');
    console.log('-------------------------------------------');
    console.log(data.text);
    console.log('-------------------------------------------\n');

    if (!data.text || data.text.trim().length === 0) {
      throw new Error('No text could be extracted from the image');
    }

    return {
      text: data.text,
      confidence: data.confidence,
      languages: 'khm+eng',
      processingTime,
      characterCount: data.text.length
    };
  } catch (error) {
    console.error('❌ OCR Service Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown OCR error';
    throw new Error(`OCR failed: ${errorMessage}`);
  }
};

/**
 * Run OCR with multiple attempts for better accuracy
 * @param imagePath - Path to the image file
 * @returns Best OCR result
 */
export const runOCRWithRetry = async (imagePath: string): Promise<string> => {
  const results: string[] = [];

  try {
    // Attempt 1: Standard preprocessing
    const standardResult = await runOCR(imagePath);
    results.push(standardResult);

    return standardResult;
  } catch (error) {
    if (results.length > 0) {
      return results[0];
    }
    throw error;
  }
};

