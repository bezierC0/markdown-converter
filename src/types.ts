export interface ConversionRequest {
  input_path: string;
  output_path: string;
  input_format?: string;
  output_format?: string;
}

export interface ConversionResult {
  success: boolean;
  output_path?: string;
  error?: string;
  message: string;
}

export interface SupportedFormat {
  name: string;
  extension: string;
  description: string;
}

export enum FileFormat {
  Markdown = 'md',
  Word = 'docx',
}

export interface FileInfo {
  name: string;
  path: string;
  format: FileFormat;
  size: number;
}
