
```javascript
#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Text Analyzer Class
class TextAnalyzer {
  constructor(text) {
    this.text = text;
    this.words = [];
    this.analyze();
  }

  analyze() {
    // Remove extra whitespace and split into words
    this.words = this.text
      .toLowerCase()
      .replace(/[^\w\s'-]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  getWordCount() {
    return this.words.length;
  }

  getUniqueWords() {
    return new Set(this.words).size;
  }

  getCharacterCount() {
    return this.text.length;
  }

  getCharacterCountNoSpaces() {
    return this.text.replace(/\s/g, '').length;
  }

  getSentenceCount() {
    const sentences = this.text.match(/[.!?]+/g) || [];
    return sentences.length;
  }

  getParagraphCount() {
    const paragraphs = this.text.split(/\n\n+/).filter(p => p.trim().length > 0);
    return paragraphs.length;
  }

  getAverageWordLength() {
    if (this.words.length === 0) return 0;
    const totalChars = this.words.reduce((sum, word) => sum + word.length, 0);
    return (totalChars / this.words.length).toFixed(2);
  }

  getAverageSentenceLength() {
    const sentenceCount = this.getSentenceCount();
    if (sentenceCount === 0) return 0;
    return (this.getWordCount() / sentenceCount).toFixed(2);
  }

  getWordFrequency(topN = 10) {
    const frequency = {};
    
    this.words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([word, count]) => ({ word, count }));
  }

  getLongestWords(topN = 5) {
    const uniqueWords = [...new Set(this.words)];
    return uniqueWords
      .sort((a, b) => b.length - a.length)
      .slice(0, topN);
  }

  getReadabilityStats() {
    const wordCount = this.getWordCount();
    const sentenceCount = this.getSentenceCount();
    const characterCount = this.getCharacterCountNoSpaces();

    if (wordCount === 0 || sentenceCount === 0) {
      return { flesch_kincaid: 0, reading_time_minutes: 0 };
    }

    // Flesch Kincaid Grade Level approximation
    const fleschKincaid = (0.39 * (wordCount / sentenceCount)) + 
                          (11.8 * (this.countSyllables() / wordCount)) - 15.59;
    
    const readingTimeMinutes = (wordCount / 200).toFixed(1);

    return {
      flesch_kincaid_grade: Math.max(0, fleschKincaid.toFixed(1)),
      reading_time_minutes: readingTimeMinutes,
      words_per_minute: 200
    };
  }

  countSyllables() {
    let syllableCount = 0;
    const vowels = 'aeiouy';
    let previousWasVowel = false;

    this.words.forEach(word => {
      let wordSyllables = 0;
      
      for (let char of word) {
        const isVowel = vowels.includes(char);
        if (isVowel && !previousWasVowel) {
          wordSyllables++;
        }
        previousWasVowel = isVowel;
      }

      // Adjust for silent e
      if (word.endsWith('e')) {
        wordSyllables--;
      }

      // Minimum 1 syllable per word
      wordSyllables = Math.max(1, wordSyllables);
      syllableCount += wordSyllables;
    });

    return syllableCount;
  }

  getFullReport() {
    return {
      text_statistics: {
        total_words: this.getWordCount(),
        unique_words: this.getUniqueWords(),
        total_characters: this.getCharacterCount(),
        total_characters_no_spaces: this.getCharacterCountNoSpaces(),
        sentences: this.getSentenceCount(),
        paragraphs: this.getParagraphCount(),
      },
      averages: {
        average_word_length: this.getAverageWordLength(),
        average_sentence_length: this.getAverageSentenceLength(),
      },
      readability: this.getReadabilityStats(),
      top_10_words: this.getWordFrequency(10),
      longest_words: this.getLongestWords(5),
    };
  }
}

// Demo text
const demoText = `
The quick brown fox jumps over the lazy dog. This pangram demonstrates the quick brown fox 
and showcases a sentence with every letter of the alphabet. Text analysis is a powerful tool 
for understanding language patterns and content structure.

Natural language processing enables computers to understand and analyze human language. 
Machine learning algorithms can identify patterns in text, classify documents, and extract 
meaningful information from large datasets. The fox jumped quickly over the sleeping dog on 
a sunny afternoon.

Text analysis helps developers, writers, and researchers understand the characteristics of 
written content. Word frequency analysis reveals which terms appear most often. Readability 
metrics help assess how easy or difficult text is to understand for different audiences.
`;

// Function to format and