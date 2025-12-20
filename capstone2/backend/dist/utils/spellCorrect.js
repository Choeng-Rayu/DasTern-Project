"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSuggestions = exports.isValidMedicine = exports.correctSpelling = void 0;
const fast_levenshtein_1 = __importDefault(require("fast-levenshtein"));
const medicine_dictionary_json_1 = __importDefault(require("../../data/medicine_dictionary.json"));
/**
 * Correct spelling of medicine names using Levenshtein distance
 * @param word - Input word to correct
 * @returns Corrected word from dictionary or original if no close match
 */
const correctSpelling = (word) => {
    if (!word || word.length < 2) {
        return word;
    }
    const dictionary = medicine_dictionary_json_1.default;
    let minDistance = Infinity;
    let suggestion = word;
    const wordLower = word.toLowerCase();
    // First, check for exact match (case-insensitive)
    for (const dictWord of dictionary) {
        if (dictWord.toLowerCase() === wordLower) {
            return dictWord; // Return properly cased version
        }
    }
    // Find closest match using Levenshtein distance
    for (const dictWord of dictionary) {
        const distance = fast_levenshtein_1.default.get(wordLower, dictWord.toLowerCase());
        // Only suggest if the distance is reasonable (less than 40% of word length)
        const threshold = Math.max(2, Math.floor(word.length * 0.4));
        if (distance < minDistance && distance <= threshold) {
            minDistance = distance;
            suggestion = dictWord;
        }
    }
    return suggestion;
};
exports.correctSpelling = correctSpelling;
/**
 * Check if a word exists in the medicine dictionary
 * @param word - Word to check
 * @returns Boolean indicating if word is in dictionary
 */
const isValidMedicine = (word) => {
    const dictionary = medicine_dictionary_json_1.default;
    const wordLower = word.toLowerCase();
    return dictionary.some(dictWord => dictWord.toLowerCase() === wordLower);
};
exports.isValidMedicine = isValidMedicine;
/**
 * Get suggestions for a misspelled word
 * @param word - Input word
 * @param maxSuggestions - Maximum number of suggestions to return
 * @returns Array of suggested corrections
 */
const getSuggestions = (word, maxSuggestions = 5) => {
    const dictionary = medicine_dictionary_json_1.default;
    const wordLower = word.toLowerCase();
    const suggestions = [];
    for (const dictWord of dictionary) {
        const distance = fast_levenshtein_1.default.get(wordLower, dictWord.toLowerCase());
        suggestions.push({ word: dictWord, distance });
    }
    // Sort by distance and return top suggestions
    return suggestions
        .sort((a, b) => a.distance - b.distance)
        .slice(0, maxSuggestions)
        .map(s => s.word);
};
exports.getSuggestions = getSuggestions;
//# sourceMappingURL=spellCorrect.js.map