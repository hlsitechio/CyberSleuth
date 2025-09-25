import React from 'react';

interface DomainInputFormProps {
  domain: string;
  setDomain: (domain: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

export const DomainInputForm: React.FC<DomainInputFormProps> = ({ domain, setDomain, onAnalyze, isLoading }) => {
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-800/50 p-2 rounded-lg border border-gray-700 shadow-lg">
        <div className="relative flex-grow w-full">
            <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="domain.com or user@domain.com"
            disabled={isLoading}
            className="w-full bg-transparent px-4 py-3 text-lg text-white placeholder-gray-500 border-0 focus:ring-0 rounded-md"
            />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto flex-shrink-0 bg-cyan-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>
    </form>
  );
};
