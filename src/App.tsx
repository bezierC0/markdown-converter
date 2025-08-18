import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { ConversionControls } from './components/ConversionControls';
import { ProgressIndicator } from './components/ProgressIndicator';
import { ErrorPanel } from './components/ErrorPanel';
import { Header } from './components/Header';
import { ConversionResult } from './types';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setResult(null);
    setError(null);
  };

  const handleValidationError = (error: string) => {
    setError(error);
    setSelectedFile(null);
  };

  const handleConversionStart = () => {
    setIsConverting(true);
    setProgress(0);
    setError(null);
    setResult(null);
  };

  const handleConversionProgress = (progress: number) => {
    setProgress(progress);
  };

  const handleConversionComplete = (result: ConversionResult) => {
    setIsConverting(false);
    setProgress(100);
    setResult(result);
    if (!result.success && result.error) {
      setError(result.error);
    }
  };

  const handleConversionError = (error: string) => {
    setIsConverting(false);
    setProgress(0);
    setError(error);
    setResult(null);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <Header />
        
        <div className="max-w-4xl mx-auto space-y-6">
          {/* File Upload Section */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Select File to Convert
            </h2>
            <FileUpload
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              disabled={isConverting}
              onValidationError={handleValidationError}
            />
          </div>

          {/* Conversion Controls */}
          {selectedFile && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Conversion Options
              </h2>
              <ConversionControls
                selectedFile={selectedFile}
                onConversionStart={handleConversionStart}
                onConversionProgress={handleConversionProgress}
                onConversionComplete={handleConversionComplete}
                onConversionError={handleConversionError}
                disabled={isConverting}
              />
            </div>
          )}

          {/* Progress Indicator */}
          {isConverting && (
            <div className="card">
              <ProgressIndicator progress={progress} />
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Conversion Result
              </h2>
              <div className={`p-4 rounded-lg ${
                result.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`font-medium ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.message}
                </p>
                {result.success && result.output_path && (
                  <p className="text-sm text-green-600 mt-2">
                    Output saved to: {result.output_path}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Error Panel */}
          {error && (
            <ErrorPanel
              error={error}
              onClear={clearError}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
