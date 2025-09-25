import React, { useState, useCallback } from 'react';
import { analyzeRawEmail } from '../services/geminiService';
import type { RawEmailAnalysisResult } from '../types';
import { LoaderIcon } from './icons/LoaderIcon';
import { RawEmailAnalysisDisplay } from './RawEmailAnalysisDisplay';

const EmailSourceInput: React.FC<{ source: string; setSource: (token: string) => void; onAnalyze: () => void; isLoading: boolean;}> = ({ source, setSource, onAnalyze, isLoading }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col items-center gap-4 bg-gray-900/50 p-2 rounded-lg border border-gray-700 shadow-lg">
        <textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Paste the full raw email source here (including all headers)..."
            disabled={isLoading}
            className="w-full h-64 bg-transparent px-4 py-3 text-sm text-white placeholder-gray-500 border-0 focus:ring-0 rounded-md font-mono resize-y"
            spellCheck="false"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-cyan-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Email Source'}
        </button>
      </div>
    </form>
  );
};


export const RawEmailAnalyzer: React.FC = () => {
    const [source, setSource] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<RawEmailAnalysisResult | null>(null);

    const handleAnalyze = useCallback(async () => {
        const trimmedSource = source.trim();
        if (!trimmedSource) {
            setError('Please paste the raw email source to analyze.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await analyzeRawEmail(trimmedSource);
            setAnalysisResult(result);
        } catch (err) {
            console.error(err);
            setError('Failed to analyze email source. The API may be unavailable. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [source]);

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-xl p-6 space-y-6">
            <p className="text-center text-gray-400 max-w-2xl mx-auto">
                Perform a deep forensic analysis on an email's raw source code to uncover spoofing, malicious links, and hidden threats.
            </p>

            <EmailSourceInput
                source={source}
                setSource={setSource}
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
            />
            
            {error && (
                <div className="mt-4 text-center bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg max-w-lg mx-auto" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            
            {isLoading && (
                 <div className="mt-8 text-center">
                    <LoaderIcon className="h-12 w-12 text-cyan-400 mx-auto animate-spin" />
                    <p className="mt-4 text-lg text-gray-400">Performing forensic analysis on email headers and content...</p>
                </div>
            )}

            {analysisResult && (
                <RawEmailAnalysisDisplay result={analysisResult} />
            )}
        </div>
    );
};