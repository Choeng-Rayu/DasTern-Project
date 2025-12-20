# DasTern - Capstone 2 Implementation

Khmer-friendly Prescription OCR & Medication Reminder App

## Project Structure

```
capstone2/
├── backend/                 # Node.js/TypeScript OCR Backend
│   ├── src/
│   │   ├── app.ts          # Express server entry
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # OCR & parsing logic
│   │   ├── utils/          # Preprocessing & spell correction
│   │   └── types/          # TypeScript interfaces
│   └── data/               # Medicine dictionary
│
└── dastern_mobile/          # Flutter Mobile App
    └── lib/
        ├── main.dart       # App entry
        ├── models/         # Data models
        ├── screens/        # UI screens
        ├── services/       # API client
        ├── utils/          # Notification helper
        └── widgets/        # UI components
```

## Quick Start

### Backend

```bash
cd capstone2/backend
npm install
npm run dev          # Development mode
# or
npm run build && npm start   # Production mode
```

Backend runs on `http://localhost:5000`

### API Endpoints

- `GET /api/health` - Health check
- `POST /api/ocr/scan` - Upload prescription image (multipart/form-data)
- `POST /api/ocr/parse` - Parse raw text (JSON body)

### Flutter App

```bash
cd capstone2/dastern_mobile
flutter pub get
flutter run          # Run on connected device/emulator
```

**Note:** Update `baseUrl` in `lib/services/api_service.dart` for your device:
- Android Emulator: `http://10.0.2.2:5000`
- iOS Simulator: `http://localhost:5000`
- Physical Device: Use your computer's IP address

## Features

- ✅ Camera/Gallery image capture
- ✅ Tesseract OCR (English + Khmer)
- ✅ Image preprocessing (grayscale, contrast, sharpening)
- ✅ Medicine name spell correction
- ✅ Prescription parsing with schedule generation
- ✅ Editable medicine list
- ✅ Local notification reminders
- ✅ Khmer language UI support

## Testing

```bash
# Backend
cd backend && npm run build

# Flutter
cd dastern_mobile && flutter test
```
