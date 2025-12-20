import express, { Router } from 'express';
import multer, { StorageEngine, FileFilterCallback } from 'multer';
import path from 'path';
import { scanPrescription, parseRawText } from '../controllers/ocrController';

const router: Router = express.Router();

// Configure multer for file uploads
const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'prescription-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (
  req: express.Request, 
  file: Express.Multer.File, 
  cb: FileFilterCallback
): void => {
  // Accept images only
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WebP) are allowed'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// POST /api/ocr/scan - Upload and scan prescription image
router.post('/scan', upload.single('image'), scanPrescription);

// POST /api/ocr/parse - Parse raw text (for testing/debugging)
router.post('/parse', parseRawText);

export default router;

