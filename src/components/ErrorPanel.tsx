import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, X, Clock, Info } from 'lucide-react';
import { getErrorCode, formatErrorForUser, getTroubleshootingTips, createErrorInfo } from '../utils/errorHandling';

interface ErrorPanelProps {
  error: string;
  onClear: () => void;
}

export const ErrorPanel: React.FC<ErrorPanelProps> = ({ error, onClear }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Create error info from the error string
  const errorCode = getErrorCode(error);
  const errorInfo = createErrorInfo(errorCode, error);
  const userFriendlyMessage = formatErrorForUser(errorInfo);
  const troubleshootingTips = getTroubleshootingTips(errorCode);

  return (
    <div className="card border-red-200 bg-red-50">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Conversion Error
            </h3>
            <div className="space-y-3">
              <p className="text-red-700">
                {userFriendlyMessage}
              </p>

              <div className="flex items-center space-x-2 text-sm text-red-600">
                <Clock className="h-4 w-4" />
                <span>Error occurred at {errorInfo.timestamp.toLocaleString()}</span>
              </div>
              
              <button
                onClick={toggleExpanded}
                className="flex items-center space-x-1 text-red-600 hover:text-red-800 transition-colors"
              >
                <span className="text-sm font-medium">
                  {isExpanded ? 'Hide' : 'Show'} error details
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              
              {isExpanded && (
                <div className="mt-3 p-3 bg-red-100 rounded-lg border border-red-200">
                  <pre className="text-sm text-red-800 whitespace-pre-wrap font-mono">
                    {error}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={onClear}
          className="p-1 hover:bg-red-100 rounded-full transition-colors flex-shrink-0"
          title="Clear error"
        >
          <X className="h-5 w-5 text-red-600" />
        </button>
      </div>
      
      <div className="mt-4 pt-4 border-t border-red-200">
        <div className="flex items-center space-x-2 mb-3">
          <Info className="h-4 w-4 text-red-600" />
          <h4 className="text-sm font-medium text-red-800">
            Troubleshooting Tips:
          </h4>
        </div>
        <ul className="text-sm text-red-700 space-y-1">
          {troubleshootingTips.map((tip, index) => (
            <li key={index}>• {tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
