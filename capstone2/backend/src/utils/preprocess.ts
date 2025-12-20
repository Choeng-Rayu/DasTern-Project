import sharp from 'sharp';
import path from 'path';

interface PreprocessOptions {
  highContrast?: boolean;
}

/**
 * Preprocess image for better OCR accuracy
 * @param imagePath - Path to the original image
 * @param options - Preprocessing options
 * @returns Path to the processed image
 */
export const cleanImage = async (
  imagePath: string,
  options: PreprocessOptions = {}
): Promise<string> => {
  try {
    const ext = path.extname(imagePath) || '';
    const baseName = path.basename(imagePath, ext);
    const dirName = path.dirname(imagePath);
    const suffix = options.highContrast ? '_high_contrast' : '_clean';
    const outputPath = path.join(dirName, `${baseName}${suffix}.png`);

    console.log(`🖼️ Preprocessing: ${imagePath} -> ${outputPath}`);

    let pipeline = sharp(imagePath);

    // Convert to grayscale for better text recognition
    pipeline = pipeline.grayscale();

    // Normalize to improve contrast
    pipeline = pipeline.normalize();

    if (options.highContrast) {
      // Apply higher contrast for difficult images
      pipeline = pipeline
        .modulate({
          brightness: 1.1,
          saturation: 0
        })
        .linear(1.5, -0.2); // Increase contrast
    }

    // Apply mild sharpening for clearer text edges
    pipeline = pipeline.sharpen({
      sigma: 1
    });

    // Resize if image is too large (helps with OCR speed)
    const metadata = await sharp(imagePath).metadata();
    if (metadata.width && metadata.height && 
        (metadata.width > 3000 || metadata.height > 3000)) {
      pipeline = pipeline.resize(3000, 3000, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Save as PNG for lossless quality
    await pipeline.png({ quality: 100 }).toFile(outputPath);

    console.log(`🖼️ Image preprocessed: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('❌ Image preprocessing error:', error);
    // Return original image if preprocessing fails
    return imagePath;
  }
};

/**
 * Deskew image if it's rotated
 * @param imagePath - Path to the image
 * @returns Path to the deskewed image
 */
export const deskewImage = async (imagePath: string): Promise<string> => {
  try {
    const ext = path.extname(imagePath);
    const baseName = path.basename(imagePath, ext);
    const dirName = path.dirname(imagePath);
    const outputPath = path.join(dirName, `${baseName}_deskewed.png`);

    await sharp(imagePath)
      .rotate() // Auto-rotate based on EXIF orientation
      .png()
      .toFile(outputPath);

    return outputPath;
  } catch (error) {
    console.error('❌ Deskew error:', error);
    return imagePath;
  }
};

