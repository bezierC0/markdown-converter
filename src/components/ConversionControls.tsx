import React, { useState } from 'react';
import { ArrowRight, Download, Settings } from 'lucide-react';
import { invoke } from '@tauri-apps/api/tauri';
import { save } from '@tauri-apps/api/dialog';
import { ConversionRequest, ConversionResult, FileFormat } from '../types';

interface ConversionControlsProps {
  selectedFile: File;
  onConversionStart: () => void;
  onConversionProgress: (progress: number) => void;
  onConversionComplete: (result: ConversionResult) => void;
  onConversionError: (error: string) => void;
  disabled?: boolean;
}

export const ConversionControls: React.FC<ConversionControlsProps> = ({
  selectedFile,
  onConversionStart,
  onConversionProgress,
  onConversionComplete,
  onConversionError,
  disabled = false,
}) => {
  const [outputFormat, setOutputFormat] = useState<FileFormat | null>(null);

  const getInputFormat = (): FileFormat | null => {
    const extension = selectedFile.name.split('.').pop()?.toLowerCase();
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

  const getDefaultOutputFormat = (): FileFormat => {
    const inputFormat = getInputFormat();
    return inputFormat === FileFormat.Markdown ? FileFormat.Word : FileFormat.Markdown;
  };

  const getOutputExtension = (format: FileFormat): string => {
    return format === FileFormat.Markdown ? 'md' : 'docx';
  };

  const getFormatName = (format: FileFormat): string => {
    return format === FileFormat.Markdown ? 'Markdown' : 'Word Document';
  };

  const handleConvert = async () => {
    try {
      onConversionStart();
      onConversionProgress(10);

      const inputFormat = getInputFormat();
      const targetFormat = outputFormat || getDefaultOutputFormat();

      if (!inputFormat) {
        throw new Error('Unsupported input file format');
      }

      // Generate default output filename
      const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
      const outputExtension = getOutputExtension(targetFormat);
      const defaultFileName = `${baseName}.${outputExtension}`;

      onConversionProgress(20);

      // Show save dialog
      const outputPath = await save({
        defaultPath: defaultFileName,
        filters: [{
          name: getFormatName(targetFormat),
          extensions: [outputExtension]
        }]
      });

      if (!outputPath) {
        onConversionError('Save operation cancelled');
        return;
      }

      onConversionProgress(40);

      // Convert file to byte array
      const fileBuffer = await selectedFile.arrayBuffer();
      const fileData = Array.from(new Uint8Array(fileBuffer));

      // Save uploaded file to temporary location
      const inputPath = await invoke<string>('save_uploaded_file', {
        fileName: selectedFile.name,
        fileData: fileData,
      });

      onConversionProgress(60);

      const request: ConversionRequest = {
        input_path: inputPath,
        output_path: outputPath,
        input_format: inputFormat,
        output_format: targetFormat,
      };

      onConversionProgress(80);

      // Call Tauri backend
      const result = await invoke<ConversionResult>('convert_file', { request });

      onConversionProgress(100);
      onConversionComplete(result);

      // Clean up temporary files
      await invoke('cleanup_temp_files');

    } catch (error) {
      console.error('Conversion error:', error);
      onConversionError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  const inputFormat = getInputFormat();
  const targetFormat = outputFormat || getDefaultOutputFormat();

  if (!inputFormat) {
    return (
      <div className="text-center py-4">
        <p className="text-red-600">Unsupported file format</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Conversion Direction */}
      <div className="flex items-center justify-center space-x-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-2">
            <Settings className="h-8 w-8 text-primary-600" />
          </div>
          <p className="text-sm font-medium text-gray-700">
            {getFormatName(inputFormat)}
          </p>
        </div>
        
        <ArrowRight className="h-6 w-6 text-gray-400" />
        
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
            <Download className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-sm font-medium text-gray-700">
            {getFormatName(targetFormat)}
          </p>
        </div>
      </div>

      {/* Format Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Convert to:
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setOutputFormat(FileFormat.Markdown)}
            disabled={disabled || inputFormat === FileFormat.Markdown}
            className={`
              p-3 rounded-lg border text-left transition-all duration-200
              ${outputFormat === FileFormat.Markdown || (outputFormat === null && targetFormat === FileFormat.Markdown)
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:border-gray-300'
              }
              ${disabled || inputFormat === FileFormat.Markdown 
                ? 'opacity-50 cursor-not-allowed' 
                : 'cursor-pointer'
              }
            `}
          >
            <div className="font-medium">Markdown</div>
            <div className="text-sm text-gray-500">.md file</div>
          </button>
          
          <button
            onClick={() => setOutputFormat(FileFormat.Word)}
            disabled={disabled || inputFormat === FileFormat.Word}
            className={`
              p-3 rounded-lg border text-left transition-all duration-200
              ${outputFormat === FileFormat.Word || (outputFormat === null && targetFormat === FileFormat.Word)
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:border-gray-300'
              }
              ${disabled || inputFormat === FileFormat.Word 
                ? 'opacity-50 cursor-not-allowed' 
                : 'cursor-pointer'
              }
            `}
          >
            <div className="font-medium">Word Document</div>
            <div className="text-sm text-gray-500">.docx file</div>
          </button>
        </div>
      </div>

      {/* Convert Button */}
      <button
        onClick={handleConvert}
        disabled={disabled}
        className={`
          w-full btn-primary py-3 text-lg font-semibold
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {disabled ? 'Converting...' : `Convert to ${getFormatName(targetFormat)}`}
      </button>
    </div>
  );
};
