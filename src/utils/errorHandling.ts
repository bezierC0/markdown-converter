export interface ErrorInfo {
  code: string;
  message: string;
  details?: string;
  timestamp: Date;
  context?: Record<string, any>;
}

export enum ErrorCode {
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  CONVERSION_FAILED = 'CONVERSION_FAILED',
  IO_ERROR = 'IO_ERROR',
  MARKITDOWN_ERROR = 'MARKITDOWN_ERROR',
  INVALID_PATH = 'INVALID_PATH',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export const createErrorInfo = (
  code: ErrorCode,
  message: string,
  details?: string,
  context?: Record<string, any>
): ErrorInfo => ({
  code,
  message,
  details,
  timestamp: new Date(),
  context,
});

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
};

export const getErrorCode = (error: unknown): ErrorCode => {
  if (error instanceof Error) {
    // Try to extract error code from error message or name
    const message = error.message.toLowerCase();
    
    if (message.includes('file not found') || message.includes('enoent')) {
      return ErrorCode.FILE_NOT_FOUND;
    }
    if (message.includes('unsupported format') || message.includes('invalid format')) {
      return ErrorCode.UNSUPPORTED_FORMAT;
    }
    if (message.includes('conversion failed')) {
      return ErrorCode.CONVERSION_FAILED;
    }
    if (message.includes('markitdown')) {
      return ErrorCode.MARKITDOWN_ERROR;
    }
    if (message.includes('invalid path') || message.includes('path')) {
      return ErrorCode.INVALID_PATH;
    }
    if (message.includes('validation')) {
      return ErrorCode.VALIDATION_ERROR;
    }
    if (message.includes('network') || message.includes('fetch')) {
      return ErrorCode.NETWORK_ERROR;
    }
  }
  
  return ErrorCode.UNKNOWN_ERROR;
};

export const formatErrorForUser = (error: ErrorInfo): string => {
  const baseMessage = error.message;
  
  switch (error.code) {
    case ErrorCode.FILE_NOT_FOUND:
      return `File not found: ${baseMessage}. Please check that the file exists and you have permission to access it.`;
    
    case ErrorCode.UNSUPPORTED_FORMAT:
      return `Unsupported file format: ${baseMessage}. Please use a supported format (.md, .markdown, or .docx).`;
    
    case ErrorCode.CONVERSION_FAILED:
      return `Conversion failed: ${baseMessage}. This might be due to a corrupted file or unsupported content.`;
    
    case ErrorCode.MARKITDOWN_ERROR:
      return `Conversion tool error: ${baseMessage}. Please ensure markitdown is properly installed.`;
    
    case ErrorCode.VALIDATION_ERROR:
      return `File validation failed: ${baseMessage}`;
    
    case ErrorCode.IO_ERROR:
      return `File system error: ${baseMessage}. Please check file permissions and available disk space.`;
    
    case ErrorCode.INVALID_PATH:
      return `Invalid file path: ${baseMessage}. Please choose a valid location for the output file.`;
    
    case ErrorCode.NETWORK_ERROR:
      return `Network error: ${baseMessage}. Please check your internet connection.`;
    
    default:
      return baseMessage;
  }
};

export const getTroubleshootingTips = (errorCode: ErrorCode): string[] => {
  switch (errorCode) {
    case ErrorCode.FILE_NOT_FOUND:
      return [
        'Verify the file exists at the specified location',
        'Check that you have read permissions for the file',
        'Ensure the file is not locked by another application',
      ];
    
    case ErrorCode.UNSUPPORTED_FORMAT:
      return [
        'Use only supported formats: .md, .markdown, or .docx',
        'Check that the file extension matches the actual file type',
        'Ensure the file is not corrupted',
      ];
    
    case ErrorCode.CONVERSION_FAILED:
      return [
        'Try converting a different file to isolate the issue',
        'Check that the input file is not password-protected',
        'Ensure the file content is valid for its format',
        'Verify you have write permissions to the output directory',
      ];
    
    case ErrorCode.MARKITDOWN_ERROR:
      return [
        'Install markitdown: pip install markitdown',
        'Ensure markitdown is available in your system PATH',
        'Try running markitdown --version in a terminal',
        'Restart the application after installing markitdown',
      ];
    
    case ErrorCode.VALIDATION_ERROR:
      return [
        'Check that the file size is under 50MB',
        'Ensure the filename contains only valid characters',
        'Verify the file is not corrupted',
      ];
    
    case ErrorCode.IO_ERROR:
      return [
        'Check available disk space',
        'Verify write permissions to the output directory',
        'Ensure the output path is valid',
        'Try selecting a different output location',
      ];
    
    default:
      return [
        'Try restarting the application',
        'Check that all dependencies are properly installed',
        'Verify your system meets the minimum requirements',
      ];
  }
};
