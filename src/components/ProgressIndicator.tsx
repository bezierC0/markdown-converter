import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProgressIndicatorProps {
  progress: number;
  message?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  message = 'Converting file...',
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <Loader2 className="h-5 w-5 text-primary-600 animate-spin" />
        <span className="text-lg font-medium text-gray-800">{message}</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      
      <div className="flex justify-between text-sm text-gray-600">
        <span>Progress</span>
        <span>{Math.round(progress)}%</span>
      </div>
    </div>
  );
};
