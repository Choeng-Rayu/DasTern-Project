"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReminders = exports.parsePrescription = void 0;
const spellCorrect_1 = require("../utils/spellCorrect");
/**
 * Parse prescription text and extract structured data
 * @param rawText - Raw OCR text from prescription image
 * @returns Structured prescription data
 */
const parsePrescription = (rawText) => {
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const medicines = [];
    let medicineId = 1;
    // Common medication patterns
    const medicinePattern = /^(\d+\.?\s*)?(.+?)\s+(\d+(?:\.\d+)?(?:mg|g|ml|mcg|tab|cap)?)\s*[xX×]?\s*(\d+)?\s*(PO|IV|IM|SC|PR|SL|TOP)?/i;
    const frequencyPattern = /(once|twice|three times|four times|\d+\s*times?)\s*(daily|a day|per day|\/day)/i;
    const timingPattern = /(morning|afternoon|evening|night|before meal|after meal|with food|ព្រឹក|ថ្ងៃ|ល្ងាច|យប់)/gi;
    for (const line of lines) {
        // Skip header lines and empty content
        if (line.length < 3 || /^(date|doctor|patient|hospital|name|age|diagnosis)/i.test(line)) {
            continue;
        }
        const match = line.match(medicinePattern);
        if (match) {
            const rawName = match[2]?.trim() || '';
            const correctedName = (0, spellCorrect_1.correctSpelling)(rawName);
            // Extract frequency from line
            const freqMatch = line.match(frequencyPattern);
            const frequency = freqMatch ? freqMatch[0] : '1 time daily';
            // Extract timing/schedule
            const timings = line.match(timingPattern) || [];
            const schedule = parseSchedule(timings, frequency);
            const medicine = {
                id: medicineId++,
                name: correctedName,
                dosage: match[3]?.trim() || '',
                quantity: match[4]?.trim() || '1',
                route: match[5]?.toUpperCase() || 'PO',
                frequency: frequency,
                schedule: schedule
            };
            medicines.push(medicine);
        }
    }
    // If no medicines found with pattern, try simpler parsing
    if (medicines.length === 0) {
        medicines.push(...parseSimpleFormat(lines));
    }
    return {
        medicines,
        rawText
    };
};
exports.parsePrescription = parsePrescription;
/**
 * Parse schedule from timing words
 */
const parseSchedule = (timings, frequency) => {
    const schedules = [];
    const defaultTimes = {
        'morning': { time: '08:00', period: 'morning' },
        'ព្រឹក': { time: '08:00', period: 'morning' },
        'afternoon': { time: '12:00', period: 'afternoon' },
        'ថ្ងៃ': { time: '12:00', period: 'afternoon' },
        'evening': { time: '18:00', period: 'evening' },
        'ល្ងាច': { time: '18:00', period: 'evening' },
        'night': { time: '21:00', period: 'night' },
        'យប់': { time: '21:00', period: 'night' }
    };
    if (timings.length > 0) {
        for (const timing of timings) {
            const normalizedTiming = timing.toLowerCase();
            const timeInfo = defaultTimes[normalizedTiming];
            if (timeInfo) {
                schedules.push({
                    time: timeInfo.time,
                    period: timeInfo.period,
                    withFood: /after meal|with food/.test(timing)
                });
            }
        }
    }
    // Default schedule based on frequency if no specific times
    if (schedules.length === 0) {
        if (/once|1\s*time/i.test(frequency)) {
            schedules.push({ time: '08:00', period: 'morning', withFood: true });
        }
        else if (/twice|2\s*times/i.test(frequency)) {
            schedules.push({ time: '08:00', period: 'morning', withFood: true });
            schedules.push({ time: '20:00', period: 'evening', withFood: true });
        }
        else if (/three|3\s*times/i.test(frequency)) {
            schedules.push({ time: '08:00', period: 'morning', withFood: true });
            schedules.push({ time: '12:00', period: 'afternoon', withFood: true });
            schedules.push({ time: '20:00', period: 'evening', withFood: true });
        }
        else {
            schedules.push({ time: '08:00', period: 'morning', withFood: true });
        }
    }
    return schedules;
};
/**
 * Simple line-by-line parsing for basic formats
 */
const parseSimpleFormat = (lines) => {
    const medicines = [];
    let id = 1;
    for (const line of lines) {
        const parts = line.split(/\s+/).filter(p => p.length > 0);
        if (parts.length >= 2) {
            const name = (0, spellCorrect_1.correctSpelling)(parts[0]);
            medicines.push({
                id: id++,
                name,
                dosage: parts[1] || '',
                quantity: parts[2] || '1',
                route: 'PO',
                frequency: '1 time daily',
                schedule: [{ time: '08:00', period: 'morning', withFood: true }]
            });
        }
    }
    return medicines;
};
/**
 * Generate reminders from medicine list
 */
const generateReminders = (medicines) => {
    const reminders = [];
    for (const medicine of medicines) {
        for (const schedule of medicine.schedule) {
            reminders.push({
                medicineId: medicine.id,
                medicineName: medicine.name,
                dosage: medicine.dosage,
                scheduledTime: schedule.time,
                period: schedule.period,
                instructions: schedule.withFood ? 'Take with food' : 'Take as directed'
            });
        }
    }
    // Sort by time
    reminders.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    return reminders;
};
exports.generateReminders = generateReminders;
//# sourceMappingURL=parserService.js.map