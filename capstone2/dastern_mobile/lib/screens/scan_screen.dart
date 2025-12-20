import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../services/api_service.dart';
import '../utils/notification_helper.dart';
import '../utils/test_helper.dart';
import '../widgets/medicine_table_widget.dart';

class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> {
  final ImagePicker _picker = ImagePicker();
  File? _selectedImage;
  OcrResult? _ocrResult;
  bool _isLoading = false;
  String? _errorMessage;

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? image = await _picker.pickImage(
        source: source,
        maxWidth: 2000,
        maxHeight: 2000,
        imageQuality: 85,
      );

      if (image != null) {
        setState(() {
          _selectedImage = File(image.path);
          _ocrResult = null;
          _errorMessage = null;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to pick image: $e';
      });
    }
  }

  Future<void> _scanPrescription() async {
    if (_selectedImage == null) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response =
          await ApiService.uploadPrescriptionImage(_selectedImage!.path);

      if (response.success && response.data != null) {
        setState(() {
          _ocrResult = response.data;
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = response.message ?? 'Failed to scan prescription';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Error: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _loadTestImage() async {
    try {
      final testImage = await TestHelper.loadTestPrescriptionImage();
      if (testImage != null) {
        setState(() {
          _selectedImage = testImage;
          _ocrResult = null;
          _errorMessage = null;
        });
      } else {
        setState(() {
          _errorMessage = 'Failed to load test image';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Error loading test image: $e';
      });
    }
  }

  Future<void> _scheduleReminders() async {
    if (_ocrResult == null) return;

    try {
      final hasPermission = await NotificationHelper.requestPermissions();
      if (!hasPermission) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Please grant notification permissions'),
              backgroundColor: Colors.orange,
            ),
          );
        }
        return;
      }

      await NotificationHelper.scheduleAllReminders(_ocrResult!.reminders);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Scheduled ${_ocrResult!.reminders.length} reminders! ការរំលឹកបានកំណត់!',
            ),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to schedule reminders: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ស្កេនវេជ្ជបញ្ជា - Scan Prescription'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Test Image Button (Debug/Testing)
            Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: ElevatedButton.icon(
                onPressed: _loadTestImage,
                icon: const Icon(Icons.image_search),
                label: const Text('Test with Sample Image'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.purple.shade200,
                  foregroundColor: Colors.purple.shade900,
                ),
              ),
            ),

            // Image selection buttons
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _pickImage(ImageSource.camera),
                    icon: const Icon(Icons.camera_alt),
                    label: const Text('Camera\nកាមេរ៉ា'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _pickImage(ImageSource.gallery),
                    icon: const Icon(Icons.photo_library),
                    label: const Text('Gallery\nវិចិត្រសាល'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Selected image preview
            if (_selectedImage != null) ...[
              Container(
                height: 200,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.file(_selectedImage!, fit: BoxFit.contain),
                ),
              ),
              const SizedBox(height: 16),

              // Scan button
              ElevatedButton.icon(
                onPressed: _isLoading ? null : _scanPrescription,
                icon: _isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.document_scanner),
                label: Text(_isLoading ? 'Scanning...' : 'Scan Prescription'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.all(16),
                  backgroundColor: Colors.blue,
                  foregroundColor: Colors.white,
                ),
              ),
            ],

            // Error message
            if (_errorMessage != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red.shade200),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error, color: Colors.red),
                    const SizedBox(width: 8),
                    Expanded(child: Text(_errorMessage!)),
                  ],
                ),
              ),
            ],

            // OCR Results
            if (_ocrResult != null) ...[
              const SizedBox(height: 24),
              const Divider(),
              const SizedBox(height: 16),
              Text(
                'Prescription Results - លទ្ធផលវេជ្ជបញ្ជា',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),

              // Medicine table
              MedicineTableWidget(
                medicines: _ocrResult!.prescription.medicines,
                onMedicineUpdated: (medicines) {
                  // Handle medicine updates if needed
                },
              ),

              const SizedBox(height: 16),

              // Schedule reminders button
              ElevatedButton.icon(
                onPressed: _scheduleReminders,
                icon: const Icon(Icons.alarm_add),
                label: const Text('Schedule Reminders\nកំណត់ការរំលឹក'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.all(16),
                  backgroundColor: Colors.green,
                  foregroundColor: Colors.white,
                ),
              ),

              const SizedBox(height: 16),

              // Reminders preview
              if (_ocrResult!.reminders.isNotEmpty) ...[
                Text(
                  'Scheduled Reminders (${_ocrResult!.reminders.length})',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 8),
                ...(_ocrResult!.reminders.map((reminder) => Card(
                      child: ListTile(
                        leading: const Icon(Icons.alarm, color: Colors.blue),
                        title: Text(reminder.medicineName),
                        subtitle: Text(
                          '${reminder.scheduledTime} - ${reminder.dosage}\n${reminder.instructions}',
                        ),
                        isThreeLine: true,
                      ),
                    ))),
              ],

              const SizedBox(height: 16),

              // Raw text (collapsible)
              ExpansionTile(
                title: const Text('Raw OCR Text'),
                children: [
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: SelectableText(
                      _ocrResult!.rawText,
                      style: const TextStyle(fontFamily: 'monospace'),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

