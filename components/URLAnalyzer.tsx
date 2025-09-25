import React, { useState, useCallback } from 'react';
import { analyzeUrl } from '../services/geminiService';
import type { URLAnalysisResult } from '../types';
import { LoaderIcon } from './icons/LoaderIcon';
import { URLAnalysisDisplay } from './URLAnalysisDisplay';

const URLInputForm: React.FC<{ url: string; setUrl: (url: string) => void; onAnalyze: () => void; isLoading: boolean;}> = ({ url, setUrl, onAnalyze, isLoading }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-900/50 p-2 rounded-lg border border-gray-700 shadow-lg">
        <div className="relative flex-grow w-full">
            <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/malicious-link"
            disabled={isLoading}
            className="w-full bg-transparent px-4 py-3 text-lg text-white placeholder-gray-500 border-0 focus:ring-0 rounded-md"
            />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto flex-shrink-0 bg-cyan-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? 'Analyzing...' : 'Analyze URL'}
        </button>
      </div>
    </form>
  );
};


export const URLAnalyzer: React.FC = () => {
    const [url, setUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<URLAnalysisResult | null>(null);

    const handleAnalyze = useCallback(async () => {
        const trimmedUrl = url.trim();
        if (!trimmedUrl) {
            setError('Please enter a URL to analyze.');
            return;
        }

        try {
            // Simple URL validation
            new URL(trimmedUrl);
        } catch (_) {
            setError('Please enter a valid URL (e.g., https://example.com).');
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await analyzeUrl(trimmedUrl);
            setAnalysisResult(result);
        } catch (err) {
            console.error(err);
            setError('Failed to analyze URL. The API may be unavailable. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [url]);

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-xl p-6 space-y-6">
            <p className="text-center text-gray-400 max-w-2xl mx-auto">
                Enter a full URL to check it against threat intelligence databases and perform a deep-link analysis for potential phishing or malware.
            </p>

            <URLInputForm
                url={url}
                setUrl={setUrl}
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
                    <p className="mt-4 text-lg text-gray-400">Performing deep analysis on the URL...</p>
                </div>
            )}

            {analysisResult && (
                <URLAnalysisDisplay result={analysisResult} />
            )}
        </div>
    );
};