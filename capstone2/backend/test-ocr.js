#!/usr/bin/env node

/**
 * Test script for OCR scanning
 * Usage: node test-ocr.js <image-path> [backend-url]
 * Example: node test-ocr.js uploads/prescription-1766218603710-151342381_clean.png
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const FormData = require('form-data');

// Get arguments
const imagePath = process.argv[2];
const backendUrl = process.argv[3] || 'http://localhost:5000';

if (!imagePath) {
  console.error('❌ Error: Please provide image path');
  console.error('Usage: node test-ocr.js <image-path> [backend-url]');
  console.error('Example: node test-ocr.js uploads/prescription-1766218603710-151342381_clean.png');
  process.exit(1);
}

// Resolve full path
const fullImagePath = path.resolve(imagePath);

if (!fs.existsSync(fullImagePath)) {
  console.error(`❌ Error: File not found: ${fullImagePath}`);
  process.exit(1);
}

console.log('🏥 DasTern OCR Test Script');
console.log('═'.repeat(50));
console.log(`📁 Image: ${fullImagePath}`);
console.log(`🔗 Backend: ${backendUrl}`);
console.log(`📦 File Size: ${(fs.statSync(fullImagePath).size / 1024).toFixed(2)} KB`);
console.log('═'.repeat(50));

// Create FormData
const form = new FormData();
form.append('image', fs.createReadStream(fullImagePath));

// Get the backend URL parts
const url = new URL(backendUrl);
const options = {
  hostname: url.hostname,
  port: url.port || 5000,
  path: '/api/ocr/scan',
  method: 'POST',
  headers: form.getHeaders()
};

console.log('\n⏳ Sending image to backend...\n');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`✅ Response Status: ${res.statusCode}`);
    console.log('═'.repeat(50));

    try {
      const result = JSON.parse(data);

      if (result.success) {
        console.log('✨ OCR SCAN SUCCESSFUL!\n');

        if (result.data) {
          const { rawText, prescription, reminders } = result.data;

          // Raw OCR text
          console.log('📝 RAW OCR TEXT:');
          console.log('─'.repeat(50));
          console.log(rawText);
          console.log('');

          // Prescription data
          if (prescription) {
            console.log('💊 PARSED PRESCRIPTION:');
            console.log('─'.repeat(50));
            if (prescription.patientName) console.log(`👤 Patient: ${prescription.patientName}`);
            if (prescription.doctorName) console.log(`👨‍⚕️ Doctor: ${prescription.doctorName}`);
            if (prescription.date) console.log(`📅 Date: ${prescription.date}`);
            console.log('');

            // Medicines
            if (prescription.medicines && prescription.medicines.length > 0) {
              console.log('💊 MEDICINES:');
              prescription.medicines.forEach((med, idx) => {
                console.log(`\n  ${idx + 1}. ${med.name}`);
                if (med.dosage) console.log(`     Dosage: ${med.dosage}`);
                if (med.frequency) console.log(`     Frequency: ${med.frequency}`);
                if (med.duration) console.log(`     Duration: ${med.duration}`);
                if (med.instructions) console.log(`     Instructions: ${med.instructions}`);
              });
              console.log('');
            }
          }

          // Reminders
          if (reminders && reminders.length > 0) {
            console.log('🔔 SCHEDULED REMINDERS:');
            console.log('─'.repeat(50));
            reminders.forEach((reminder, idx) => {
              console.log(`\n  ${idx + 1}. ${reminder.title}`);
              if (reminder.description) console.log(`     Description: ${reminder.description}`);
              if (reminder.scheduledTime) console.log(`     Time: ${reminder.scheduledTime}`);
              if (reminder.recurrence) console.log(`     Recurrence: ${reminder.recurrence}`);
            });
            console.log('');
          }

          console.log('═'.repeat(50));
          console.log('✅ Test completed successfully!');
        }
      } else {
        console.log('❌ OCR FAILED');
        console.log(`Message: ${result.message}`);
      }
    } catch (e) {
      console.log('❌ Error parsing response:');
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error sending request:');
  console.error(error.message);
  if (error.code === 'ECONNREFUSED') {
    console.error(`\n⚠️  Cannot connect to ${options.hostname}:${options.port}`);
    console.error('Make sure the backend is running: npm start');
  }
  process.exit(1);
});

form.pipe(req);
