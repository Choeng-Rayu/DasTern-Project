"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deskewImage = exports.cleanImage = void 0;
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
/**
 * Preprocess image for better OCR accuracy
 * @param imagePath - Path to the original image
 * @param options - Preprocessing options
 * @returns Path to the processed image
 */
const cleanImage = async (imagePath, options = {}) => {
    try {
        const ext = path_1.default.extname(imagePath);
        const baseName = path_1.default.basename(imagePath, ext);
        const dirName = path_1.default.dirname(imagePath);
        const suffix = options.highContrast ? '_high_contrast' : '_clean';
        const outputPath = path_1.default.join(dirName, `${baseName}${suffix}.png`);
        let pipeline = (0, sharp_1.default)(imagePath);
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
        const metadata = await (0, sharp_1.default)(imagePath).metadata();
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
    }
    catch (error) {
        console.error('❌ Image preprocessing error:', error);
        // Return original image if preprocessing fails
        return imagePath;
    }
};
exports.cleanImage = cleanImage;
/**
 * Deskew image if it's rotated
 * @param imagePath - Path to the image
 * @returns Path to the deskewed image
 */
const deskewImage = async (imagePath) => {
    try {
        const ext = path_1.default.extname(imagePath);
        const baseName = path_1.default.basename(imagePath, ext);
        const dirName = path_1.default.dirname(imagePath);
        const outputPath = path_1.default.join(dirName, `${baseName}_deskewed.png`);
        await (0, sharp_1.default)(imagePath)
            .rotate() // Auto-rotate based on EXIF orientation
            .png()
            .toFile(outputPath);
        return outputPath;
    }
    catch (error) {
        console.error('❌ Deskew error:', error);
        return imagePath;
    }
};
exports.deskewImage = deskewImage;
//# sourceMappingURL=preprocess.js.map