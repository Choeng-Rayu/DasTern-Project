import levenshtein from 'fast-levenshtein';
import medicineDictionary from '../../data/medicine_dictionary.json';

// Type for the dictionary
type MedicineDictionary = string[];

/**
 * Correct spelling of medicine names using Levenshtein distance
 * @param word - Input word to correct
 * @returns Corrected word from dictionary or original if no close match
 */
export const correctSpelling = (word: string): string => {
  if (!word || word.length < 2) {
    return word;
  }

  const dictionary: MedicineDictionary = medicineDictionary as MedicineDictionary;
  
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
    const distance = levenshtein.get(wordLower, dictWord.toLowerCase());
    
    // Only suggest if the distance is reasonable (less than 40% of word length)
    const threshold = Math.max(2, Math.floor(word.length * 0.4));
    
    if (distance < minDistance && distance <= threshold) {
      minDistance = distance;
      suggestion = dictWord;
    }
  }

  return suggestion;
};

/**
 * Check if a word exists in the medicine dictionary
 * @param word - Word to check
 * @returns Boolean indicating if word is in dictionary
 */
export const isValidMedicine = (word: string): boolean => {
  const dictionary: MedicineDictionary = medicineDictionary as MedicineDictionary;
  const wordLower = word.toLowerCase();
  
  return dictionary.some(dictWord => dictWord.toLowerCase() === wordLower);
};

/**
 * Get suggestions for a misspelled word
 * @param word - Input word
 * @param maxSuggestions - Maximum number of suggestions to return
 * @returns Array of suggested corrections
 */
export const getSuggestions = (word: string, maxSuggestions: number = 5): string[] => {
  const dictionary: MedicineDictionary = medicineDictionary as MedicineDictionary;
  const wordLower = word.toLowerCase();
  
  const suggestions: { word: string; distance: number }[] = [];

  for (const dictWord of dictionary) {
    const distance = levenshtein.get(wordLower, dictWord.toLowerCase());
    suggestions.push({ word: dictWord, distance });
  }

  // Sort by distance and return top suggestions
  return suggestions
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxSuggestions)
    .map(s => s.word);
};

