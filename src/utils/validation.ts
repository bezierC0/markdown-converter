import { FileFormat } from '../types';

// Maximum file size: 50MB
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Allowed MIME types for additional security
export const ALLOWED_MIME_TYPES = {
  [FileFormat.Markdown]: ['text/markdown', 'text/plain'],
  [FileFormat.Word]: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-word.document.macroEnabled.12'
  ],
};

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateFile = (file: File): ValidationResult => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds maximum limit of ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB`,
    };
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension) {
    return {
      isValid: false,
      error: 'File must have a valid extension',
    };
  }

  let format: FileFormat;
  switch (extension) {
    case 'md':
    case 'markdown':
      format = FileFormat.Markdown;
      break;
    case 'docx':
      format = FileFormat.Word;
      break;
    default:
      return {
        isValid: false,
        error: `Unsupported file extension: .${extension}. Supported formats: .md, .markdown, .docx`,
      };
  }

  // Check MIME type for additional security
  const allowedMimeTypes = ALLOWED_MIME_TYPES[format];
  if (!allowedMimeTypes.includes(file.type) && file.type !== '') {
    // Note: Some browsers don't set MIME type correctly, so we allow empty type
    console.warn(`Unexpected MIME type: ${file.type} for format ${format}`);
  }

  // Check for potentially dangerous file names
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return {
      isValid: false,
      error: 'Invalid file name. File names cannot contain path separators or relative path indicators.',
    };
  }

  return { isValid: true };
};

export const sanitizeFileName = (fileName: string): string => {
  // Remove or replace potentially dangerous characters
  return fileName
    .replace(/[<>:"/\\|?*]/g, '_') // Replace Windows forbidden characters
    .replace(/\.\./g, '_') // Replace relative path indicators
    .replace(/^\./, '_') // Don't allow files starting with dot
    .trim();
};

export const getSecureOutputPath = (inputFileName: string, outputFormat: FileFormat): string => {
  const baseName = inputFileName.replace(/\.[^/.]+$/, '');
  const sanitizedBaseName = sanitizeFileName(baseName);
  const extension = outputFormat === FileFormat.Markdown ? 'md' : 'docx';
  return `${sanitizedBaseName}.${extension}`;
};
