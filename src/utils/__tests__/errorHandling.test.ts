import {
  createErrorInfo,
  getErrorMessage,
  getErrorCode,
  formatErrorForUser,
  getTroubleshootingTips,
  ErrorCode,
} from '../errorHandling';

describe('errorHandling utils', () => {
  describe('createErrorInfo', () => {
    it('should create error info with all fields', () => {
      const context = { file: 'test.md' };
      const errorInfo = createErrorInfo(
        ErrorCode.FILE_NOT_FOUND,
        'File not found',
        'Additional details',
        context
      );

      expect(errorInfo.code).toBe(ErrorCode.FILE_NOT_FOUND);
      expect(errorInfo.message).toBe('File not found');
      expect(errorInfo.details).toBe('Additional details');
      expect(errorInfo.context).toBe(context);
      expect(errorInfo.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('getErrorMessage', () => {
    it('should extract message from Error object', () => {
      const error = new Error('Test error message');
      expect(getErrorMessage(error)).toBe('Test error message');
    });

    it('should return string errors as-is', () => {
      expect(getErrorMessage('String error')).toBe('String error');
    });

    it('should handle unknown error types', () => {
      expect(getErrorMessage(null)).toBe('An unknown error occurred');
      expect(getErrorMessage(undefined)).toBe('An unknown error occurred');
      expect(getErrorMessage(123)).toBe('An unknown error occurred');
    });
  });

  describe('getErrorCode', () => {
    it('should detect file not found errors', () => {
      const error = new Error('file not found');
      expect(getErrorCode(error)).toBe(ErrorCode.FILE_NOT_FOUND);
    });

    it('should detect unsupported format errors', () => {
      const error = new Error('unsupported format detected');
      expect(getErrorCode(error)).toBe(ErrorCode.UNSUPPORTED_FORMAT);
    });

    it('should detect conversion failed errors', () => {
      const error = new Error('conversion failed due to corruption');
      expect(getErrorCode(error)).toBe(ErrorCode.CONVERSION_FAILED);
    });

    it('should detect markitdown errors', () => {
      const error = new Error('markitdown command not found');
      expect(getErrorCode(error)).toBe(ErrorCode.MARKITDOWN_ERROR);
    });

    it('should default to unknown error', () => {
      const error = new Error('some random error');
      expect(getErrorCode(error)).toBe(ErrorCode.UNKNOWN_ERROR);
    });
  });

  describe('formatErrorForUser', () => {
    it('should format file not found errors', () => {
      const errorInfo = createErrorInfo(ErrorCode.FILE_NOT_FOUND, 'test.md');
      const formatted = formatErrorForUser(errorInfo);
      expect(formatted).toContain('File not found');
      expect(formatted).toContain('permission to access');
    });

    it('should format unsupported format errors', () => {
      const errorInfo = createErrorInfo(ErrorCode.UNSUPPORTED_FORMAT, '.txt');
      const formatted = formatErrorForUser(errorInfo);
      expect(formatted).toContain('Unsupported file format');
      expect(formatted).toContain('supported format');
    });

    it('should format markitdown errors', () => {
      const errorInfo = createErrorInfo(ErrorCode.MARKITDOWN_ERROR, 'command not found');
      const formatted = formatErrorForUser(errorInfo);
      expect(formatted).toContain('Conversion tool error');
      expect(formatted).toContain('properly installed');
    });
  });

  describe('getTroubleshootingTips', () => {
    it('should provide tips for file not found errors', () => {
      const tips = getTroubleshootingTips(ErrorCode.FILE_NOT_FOUND);
      expect(tips).toContain('Verify the file exists at the specified location');
      expect(tips.length).toBeGreaterThan(0);
    });

    it('should provide tips for markitdown errors', () => {
      const tips = getTroubleshootingTips(ErrorCode.MARKITDOWN_ERROR);
      expect(tips.some(tip => tip.includes('pip install markitdown'))).toBe(true);
    });

    it('should provide default tips for unknown errors', () => {
      const tips = getTroubleshootingTips(ErrorCode.UNKNOWN_ERROR);
      expect(tips).toContain('Try restarting the application');
    });
  });
});
