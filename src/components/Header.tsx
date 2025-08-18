import React from 'react';
import { FileText, ArrowLeftRight } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="text-center mb-8">
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center space-x-2 text-primary-600">
          <FileText size={32} />
          <ArrowLeftRight size={24} />
          <FileText size={32} />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        Markdown Converter
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Convert between Markdown and Word documents with ease. 
        Drag and drop your files or click to browse.
      </p>
    </header>
  );
};
