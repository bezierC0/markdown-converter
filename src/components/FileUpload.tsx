import React, { useCallback, useState } from 'react';
import { Upload, File, X, AlertTriangle } from 'lucide-react';
import { FileFormat } from '../types';
import { validateFile, ValidationResult } from '../utils/validation';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  disabled?: boolean;
  onValidationError?: (error: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  selectedFile,
  disabled = false,
  onValidationError,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const getFileFormat = (file: File): FileFormat | null => {
    const extension = file.name.split('.').pop()?.toLowerCase();
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

  const handleFileValidation = (file: File): boolean => {
    const validation = validateFile(file);
    if (!validation.isValid) {
      onValidationError?.(validation.error || 'Invalid file');
      return false;
    }
    return true;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && handleFileValidation(file)) {
      onFileSelect(file);
    }
  }, [onFileSelect, disabled]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && handleFileValidation(file)) {
      onFileSelect(file);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [onFileSelect, handleFileValidation]);

  const clearFile = () => {
    onFileSelect(null as any);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
            ${isDragOver 
              ? 'border-primary-400 bg-primary-50' 
              : 'border-gray-300 hover:border-primary-300'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && document.getElementById('file-input')?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drop your file here or click to browse
          </p>
          <p className="text-sm text-gray-500">
            Supports: Markdown (.md) and Word (.docx) files
          </p>
          <input
            id="file-input"
            type="file"
            accept=".md,.markdown,.docx"
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-3">
            <File className="h-8 w-8 text-primary-600" />
            <div>
              <p className="font-medium text-gray-800">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {formatFileSize(selectedFile.size)} • {getFileFormat(selectedFile)?.toUpperCase()}
              </p>
            </div>
          </div>
          {!disabled && (
            <button
              onClick={clearFile}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              title="Remove file"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
