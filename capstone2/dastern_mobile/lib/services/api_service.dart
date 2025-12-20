import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../models/prescription.dart';

/// API Response wrapper
class ApiResponse<T> {
  final bool success;
  final T? data;
  final String? message;

  ApiResponse({
    required this.success,
    this.data,
    this.message,
  });
}

/// OCR Result from backend
class OcrResult {
  final String rawText;
  final PrescriptionData prescription;
  final List<Reminder> reminders;

  OcrResult({
    required this.rawText,
    required this.prescription,
    required this.reminders,
  });

  factory OcrResult.fromJson(Map<String, dynamic> json) {
    return OcrResult(
      rawText: json['rawText'] ?? '',
      prescription: PrescriptionData.fromJson(json['prescription'] ?? {}),
      reminders: (json['reminders'] as List<dynamic>?)
              ?.map((r) => Reminder.fromJson(r))
              .toList() ??
          [],
    );
  }
}

/// API Service for communicating with the backend
class ApiService {
  // Backend URL selection based on platform
  static String get baseUrl {
    // Android emulator uses 10.0.2.2 to reach host localhost
    try {
      if (Platform.isAndroid) return 'http://10.0.2.2:5000';
    } catch (_) {}
    // Default to localhost for desktop, web, and physical devices
    return 'http://localhost:5000';
  }

  /// Upload prescription image and get OCR results
  static Future<ApiResponse<OcrResult>> uploadPrescriptionImage(
      String imagePath) async {
    try {
      final uri = Uri.parse('$baseUrl/api/ocr/scan');
      final request = http.MultipartRequest('POST', uri);

      // Add the image file
      request.files.add(
        await http.MultipartFile.fromPath('image', imagePath),
      );

      // Send the request
      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        final jsonData = jsonDecode(response.body);
        if (jsonData['success'] == true) {
          return ApiResponse(
            success: true,
            data: OcrResult.fromJson(jsonData['data']),
          );
        } else {
          return ApiResponse(
            success: false,
            message: jsonData['message'] ?? 'Unknown error',
          );
        }
      } else {
        return ApiResponse(
          success: false,
          message: 'Server error: ${response.statusCode}',
        );
      }
    } on SocketException {
      return ApiResponse(
        success: false,
        message: 'Cannot connect to server. Please check your connection.',
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        message: 'Error: ${e.toString()}',
      );
    }
  }

  /// Parse raw text (for testing)
  static Future<ApiResponse<OcrResult>> parseRawText(String text) async {
    try {
      final uri = Uri.parse('$baseUrl/api/ocr/parse');
      final response = await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'text': text}),
      );

      if (response.statusCode == 200) {
        final jsonData = jsonDecode(response.body);
        if (jsonData['success'] == true) {
          return ApiResponse(
            success: true,
            data: OcrResult.fromJson(jsonData['data']),
          );
        } else {
          return ApiResponse(
            success: false,
            message: jsonData['message'] ?? 'Unknown error',
          );
        }
      } else {
        return ApiResponse(
          success: false,
          message: 'Server error: ${response.statusCode}',
        );
      }
    } catch (e) {
      return ApiResponse(
        success: false,
        message: 'Error: ${e.toString()}',
      );
    }
  }

  /// Check if backend is available
  static Future<bool> checkHealth() async {
    try {
      final uri = Uri.parse('$baseUrl/api/health');
      final response = await http.get(uri).timeout(
            const Duration(seconds: 5),
          );
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
}

