import React, { useState, useCallback } from 'react';
import { analyzeSecrets } from '../services/geminiService';
import type { SecretAnalysisResult } from '../types';
import { LoaderIcon } from './icons/LoaderIcon';
import { SecretAnalysisDisplay } from './SecretAnalysisDisplay';

const SecretInputForm: React.FC<{ text: string; setText: (text: string) => void; onAnalyze: () => void; isLoading: boolean;}> = ({ text, setText, onAnalyze, isLoading }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col items-center gap-4 bg-gray-900/50 p-2 rounded-lg border border-gray-700 shadow-lg">
        <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste code, logs, or any text to scan for secrets..."
            disabled={isLoading}
            className="w-full h-64 bg-transparent px-4 py-3 text-sm text-white placeholder-gray-500 border-0 focus:ring-0 rounded-md font-mono resize-y"
            spellCheck="false"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-cyan-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? 'Scanning...' : 'Scan for Secrets'}
        </button>
      </div>
    </form>
  );
};


export const SecretScanner: React.FC = () => {
    const [text, setText] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<SecretAnalysisResult | null>(null);

    const handleAnalyze = useCallback(async () => {
        const trimmedText = text.trim();
        if (!trimmedText) {
            setError('Please enter some text to scan.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await analyzeSecrets(trimmedText);
            setAnalysisResult(result);
        } catch (err) {
            console.error(err);
            setError('Failed to scan for secrets. The API may be unavailable. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [text]);

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-xl p-6 space-y-6">
            <p className="text-center text-gray-400 max-w-2xl mx-auto">
                Scan for exposed credentials, API keys, and other sensitive data in any block of text to prevent leaks.
            </p>

            <SecretInputForm
                text={text}
                setText={setText}
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
                    <p className="mt-4 text-lg text-gray-400">Scanning for secrets and sensitive data...</p>
                </div>
            )}

            {analysisResult && (
                <SecretAnalysisDisplay result={analysisResult} />
            )}
        </div>
    );
};