import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:path_provider/path_provider.dart';

/// Helper class for testing OCR with sample images
class TestHelper {
  /// Load a test prescription image from assets
  static Future<File?> loadTestPrescriptionImage() async {
    try {
      // Get temporary directory
      final tempDir = await getTemporaryDirectory();
      final testImagePath =
          '${tempDir.path}/prescription-1766218603710-151342381_clean.png';

      // Check if file already exists
      if (File(testImagePath).existsSync()) {
        return File(testImagePath);
      }

      // Load image from assets
      final assetImage =
          await rootBundle.load('assets/prescription-1766218603710-151342381_clean.png');

      // Write to temporary file
      final file = File(testImagePath);
      await file.writeAsBytes(assetImage.buffer.asUint8List());

      return file;
    } catch (e) {
      // Log error without print statement
      debugPrint('Error loading test image: $e');
      return null;
    }
  }

  /// Get test image details
  static Map<String, String> getTestImageInfo() {
    return {
      'filename': 'prescription-1766218603710-151342381_clean.png',
      'type': 'Prescription Image',
      'size': '~400 KB',
      'description':
          'A sample prescription image for testing OCR functionality',
    };
  }
}
