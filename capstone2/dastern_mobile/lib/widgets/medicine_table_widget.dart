import 'package:flutter/material.dart';
import '../models/prescription.dart';

/// Widget to display and edit medicines from prescription
class MedicineTableWidget extends StatefulWidget {
  final List<Medicine> medicines;
  final Function(List<Medicine>)? onMedicineUpdated;

  const MedicineTableWidget({
    super.key,
    required this.medicines,
    this.onMedicineUpdated,
  });

  @override
  State<MedicineTableWidget> createState() => _MedicineTableWidgetState();
}

class _MedicineTableWidgetState extends State<MedicineTableWidget> {
  late List<Medicine> _medicines;

  @override
  void initState() {
    super.initState();
    _medicines = List.from(widget.medicines);
  }

  @override
  void didUpdateWidget(MedicineTableWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.medicines != widget.medicines) {
      _medicines = List.from(widget.medicines);
    }
  }

  void _editMedicine(int index) {
    final medicine = _medicines[index];
    showDialog(
      context: context,
      builder: (context) => _EditMedicineDialog(
        medicine: medicine,
        onSave: (updated) {
          setState(() {
            _medicines[index] = updated;
          });
          widget.onMedicineUpdated?.call(_medicines);
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_medicines.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.grey.shade100,
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Column(
          children: [
            Icon(Icons.medication_outlined, size: 48, color: Colors.grey),
            SizedBox(height: 8),
            Text(
              'No medicines found\nរកមិនឃើញថ្នាំ',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
            ),
          ],
        ),
      );
    }

    return Column(
      children: [
        // Header
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.primaryContainer,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
          ),
          child: const Row(
            children: [
              Expanded(flex: 3, child: Text('Medicine', style: TextStyle(fontWeight: FontWeight.bold))),
              Expanded(flex: 2, child: Text('Dosage', style: TextStyle(fontWeight: FontWeight.bold))),
              Expanded(flex: 1, child: Text('Qty', style: TextStyle(fontWeight: FontWeight.bold))),
              SizedBox(width: 40),
            ],
          ),
        ),
        // Medicine rows
        ...List.generate(_medicines.length, (index) {
          final med = _medicines[index];
          return Container(
            decoration: BoxDecoration(
              color: index.isEven ? Colors.white : Colors.grey.shade50,
              border: Border(
                bottom: BorderSide(color: Colors.grey.shade200),
              ),
            ),
            child: InkWell(
              onTap: () => _editMedicine(index),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                child: Row(
                  children: [
                    Expanded(
                      flex: 3,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(med.name, style: const TextStyle(fontWeight: FontWeight.w500)),
                          Text(med.route, style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
                        ],
                      ),
                    ),
                    Expanded(flex: 2, child: Text(med.dosage)),
                    Expanded(flex: 1, child: Text(med.quantity)),
                    const SizedBox(
                      width: 40,
                      child: Icon(Icons.edit, size: 18, color: Colors.blue),
                    ),
                  ],
                ),
              ),
            ),
          );
        }),
        // Schedule info
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.blue.shade50,
            borderRadius: const BorderRadius.vertical(bottom: Radius.circular(8)),
          ),
          child: Text(
            'Tap a medicine to edit • ចុចលើថ្នាំដើម្បីកែប្រែ',
            style: TextStyle(fontSize: 12, color: Colors.blue.shade700),
            textAlign: TextAlign.center,
          ),
        ),
      ],
    );
  }
}

/// Dialog for editing medicine details
class _EditMedicineDialog extends StatefulWidget {
  final Medicine medicine;
  final Function(Medicine) onSave;

  const _EditMedicineDialog({
    required this.medicine,
    required this.onSave,
  });

  @override
  State<_EditMedicineDialog> createState() => _EditMedicineDialogState();
}

class _EditMedicineDialogState extends State<_EditMedicineDialog> {
  late TextEditingController _nameController;
  late TextEditingController _dosageController;
  late TextEditingController _quantityController;
  late String _route;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.medicine.name);
    _dosageController = TextEditingController(text: widget.medicine.dosage);
    _quantityController = TextEditingController(text: widget.medicine.quantity);
    _route = widget.medicine.route;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _dosageController.dispose();
    _quantityController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Edit Medicine\nកែប្រែថ្នាំ'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Medicine Name',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _dosageController,
              decoration: const InputDecoration(
                labelText: 'Dosage',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _quantityController,
              decoration: const InputDecoration(
                labelText: 'Quantity',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _route,
              decoration: const InputDecoration(
                labelText: 'Route',
                border: OutlineInputBorder(),
              ),
              items: const [
                DropdownMenuItem(value: 'PO', child: Text('PO (Oral)')),
                DropdownMenuItem(value: 'IV', child: Text('IV (Intravenous)')),
                DropdownMenuItem(value: 'IM', child: Text('IM (Intramuscular)')),
                DropdownMenuItem(value: 'SC', child: Text('SC (Subcutaneous)')),
                DropdownMenuItem(value: 'TOP', child: Text('TOP (Topical)')),
              ],
              onChanged: (value) {
                setState(() {
                  _route = value ?? 'PO';
                });
              },
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: () {
            final updated = widget.medicine.copyWith(
              name: _nameController.text,
              dosage: _dosageController.text,
              quantity: _quantityController.text,
              route: _route,
            );
            widget.onSave(updated);
            Navigator.pop(context);
          },
          child: const Text('Save'),
        ),
      ],
    );
  }
}

