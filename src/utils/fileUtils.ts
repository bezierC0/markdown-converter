import { FileFormat } from '../types';

export const getFileFormat = (fileName: string): FileFormat | null => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'md':
    case 'markdown':
      return FileFormat.Markdown;
    case 'docx':
      return FileFormat.Word;
    default:
      return null;
  }
};

export const isValidFile = (file: File): boolean => {
  return getFileFormat(file.name) !== null;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFormatName = (format: FileFormat): string => {
  switch (format) {
    case FileFormat.Markdown:
      return 'Markdown';
    case FileFormat.Word:
      return 'Word Document';
    default:
      return 'Unknown';
  }
};

export const getOutputExtension = (format: FileFormat): string => {
  switch (format) {
    case FileFormat.Markdown:
      return 'md';
    case FileFormat.Word:
      return 'docx';
    default:
      return 'txt';
  }
};

export const generateOutputFileName = (inputFileName: string, outputFormat: FileFormat): string => {
  const baseName = inputFileName.replace(/\.[^/.]+$/, '');
  const extension = getOutputExtension(outputFormat);
  return `${baseName}.${extension}`;
};
