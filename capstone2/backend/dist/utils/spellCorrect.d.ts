/**
 * Correct spelling of medicine names using Levenshtein distance
 * @param word - Input word to correct
 * @returns Corrected word from dictionary or original if no close match
 */
export declare const correctSpelling: (word: string) => string;
/**
 * Check if a word exists in the medicine dictionary
 * @param word - Word to check
 * @returns Boolean indicating if word is in dictionary
 */
export declare const isValidMedicine: (word: string) => boolean;
/**
 * Get suggestions for a misspelled word
 * @param word - Input word
 * @param maxSuggestions - Maximum number of suggestions to return
 * @returns Array of suggested corrections
 */
export declare const getSuggestions: (word: string, maxSuggestions?: number) => string[];
//# sourceMappingURL=spellCorrect.d.ts.map