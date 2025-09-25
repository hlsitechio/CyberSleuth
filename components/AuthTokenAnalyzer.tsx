import React, { useState, useCallback } from 'react';
import { analyzeAuthToken } from '../services/geminiService';
import type { TokenAnalysisResult } from '../types';
import { LoaderIcon } from './icons/LoaderIcon';
import { TokenAnalysisDisplay } from './TokenAnalysisDisplay';

const TokenInputForm: React.FC<{ token: string; setToken: (token: string) => void; onAnalyze: () => void; isLoading: boolean;}> = ({ token, setToken, onAnalyze, isLoading }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col items-center gap-4 bg-gray-900/50 p-2 rounded-lg border border-gray-700 shadow-lg">
        <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your auth token here (e.g., a JWT)"
            disabled={isLoading}
            className="w-full h-32 bg-transparent px-4 py-3 text-sm text-white placeholder-gray-500 border-0 focus:ring-0 rounded-md font-mono resize-none"
            spellCheck="false"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-cyan-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Token'}
        </button>
      </div>
    </form>
  );
};


export const AuthTokenAnalyzer: React.FC = () => {
    const [token, setToken] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<TokenAnalysisResult | null>(null);

    const handleAnalyze = useCallback(async () => {
        const trimmedToken = token.trim();
        if (!trimmedToken) {
            setError('Please enter a token to analyze.');
            return;
        }
        
        try {
            const url = new URL(trimmedToken);
            if (url.protocol === "http:" || url.protocol === "https:") {
                setError("This appears to be a URL. Please use the 'URL Analyzer' tab for a proper analysis.");
                return;
            }
        } catch (_) {
            // Not a valid URL, so we can proceed.
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await analyzeAuthToken(trimmedToken);
            setAnalysisResult(result);
        } catch (err)
 {
            console.error(err);
            setError('Failed to analyze token. The API may be unavailable. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-xl p-6 space-y-6">
            <p className="text-center text-gray-400 max-w-2xl mx-auto">
                Paste a JWT or other auth token to decode it and check for common security vulnerabilities and misconfigurations.
            </p>

            <TokenInputForm
                token={token}
                setToken={setToken}
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
                    <p className="mt-4 text-lg text-gray-400">Performing security analysis on the token...</p>
                </div>
            )}

            {analysisResult && (
                <TokenAnalysisDisplay result={analysisResult} />
            )}
        </div>
    );
};