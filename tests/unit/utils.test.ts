import { cn, normalizeBreed } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle conditional class names', () => {
      const result = cn('class1', { 'class2': true, 'class3': false });
      expect(result).toBe('class1 class2');
    });

    it('should handle array of class names', () => {
      const result = cn(['class1', 'class2'], 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('should handle tailwind merge functionality', () => {
      const result = cn('px-2 py-1 bg-red text-white', 'px-3 bg-blue');
      // The exact result depends on tailwind-merge implementation, but it should merge properly
      expect(result).toContain('px-3');
      expect(result).toContain('py-1');
      expect(result).toContain('bg-blue');
      expect(result).toContain('text-white');
    });
  });

  describe('normalizeBreed', () => {
    it('should normalize breed to title case', () => {
      const result = normalizeBreed('siamese');
      expect(result).toBe('Siamese');
    });

    it('should handle multiple words', () => {
      const result = normalizeBreed('siamese mix');
      expect(result).toBe('Siamese Mix');
    });

    it('should trim extra spaces', () => {
      const result = normalizeBreed(' siamese  mix  ');
      expect(result).toBe('Siamese Mix');
    });

    it('should handle multiple spaces between words', () => {
      const result = normalizeBreed('siamese    mix');
      expect(result).toBe('Siamese Mix');
    });

    it('should handle empty string', () => {
      const result = normalizeBreed('');
      expect(result).toBe('');
    });

    it('should handle single character', () => {
      const result = normalizeBreed('s');
      expect(result).toBe('S');
    });

    it('should handle mixed case input', () => {
      const result = normalizeBreed('SiAmEsE MiX');
      expect(result).toBe('Siamese Mix');
    });
  });
});
