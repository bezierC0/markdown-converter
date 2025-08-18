import { validateFile, sanitizeFileName, getSecureOutputPath, MAX_FILE_SIZE } from '../validation';
import { FileFormat } from '../../types';

// Mock File constructor for testing
class MockFile {
  name: string;
  size: number;
  type: string;

  constructor(name: string, size: number, type: string = '') {
    this.name = name;
    this.size = size;
    this.type = type;
  }
}

describe('validation utils', () => {
  describe('validateFile', () => {
    it('should validate markdown files', () => {
      const file = new MockFile('test.md', 1000, 'text/markdown') as any;
      const result = validateFile(file);
      expect(result.isValid).toBe(true);
    });

    it('should validate word files', () => {
      const file = new MockFile('test.docx', 1000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') as any;
      const result = validateFile(file);
      expect(result.isValid).toBe(true);
    });

    it('should reject files that are too large', () => {
      const file = new MockFile('test.md', MAX_FILE_SIZE + 1) as any;
      const result = validateFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('exceeds maximum limit');
    });

    it('should reject files without extensions', () => {
      const file = new MockFile('test', 1000) as any;
      const result = validateFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('valid extension');
    });

    it('should reject unsupported file extensions', () => {
      const file = new MockFile('test.txt', 1000) as any;
      const result = validateFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Unsupported file extension');
    });

    it('should reject files with dangerous names', () => {
      const file = new MockFile('../test.md', 1000) as any;
      const result = validateFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid file name');
    });

    it('should reject files with path separators', () => {
      const file = new MockFile('folder/test.md', 1000) as any;
      const result = validateFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid file name');
    });
  });

  describe('sanitizeFileName', () => {
    it('should remove dangerous characters', () => {
      const result = sanitizeFileName('test<>:"/\\|?*.md');
      expect(result).toBe('test_________.md');
    });

    it('should replace relative path indicators', () => {
      const result = sanitizeFileName('..test.md');
      expect(result).toBe('_test.md');
    });

    it('should not allow files starting with dot', () => {
      const result = sanitizeFileName('.hidden.md');
      expect(result).toBe('hidden.md');
    });

    it('should trim whitespace', () => {
      const result = sanitizeFileName('  test.md  ');
      expect(result).toBe('test.md');
    });
  });

  describe('getSecureOutputPath', () => {
    it('should generate secure output path for markdown', () => {
      const result = getSecureOutputPath('test.docx', FileFormat.Markdown);
      expect(result).toBe('test.md');
    });

    it('should generate secure output path for word', () => {
      const result = getSecureOutputPath('test.md', FileFormat.Word);
      expect(result).toBe('test.docx');
    });

    it('should sanitize dangerous input filenames', () => {
      const result = getSecureOutputPath('../dangerous<>.docx', FileFormat.Markdown);
      expect(result).toBe('_dangerous__.md');
    });
  });
});
