import React, { useState, useCallback } from 'react';
import { DomainInputForm } from './DomainInputForm';
import { ResultsDisplay } from './ResultsDisplay';
import { analyzeInput } from '../services/geminiService';
import type { DomainAnalysisResult } from '../types';

export const AddressAnalyzer: React.FC = () => {
    const [domain, setDomain] = useState<string>('');
    const [analysisResult, setAnalysisResult] = useState<DomainAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyzeAddress = useCallback(async () => {
        const trimmedInput = domain.trim().toLowerCase();
        if (!trimmedInput) {
            setError('Please enter a domain name or email address.');
            return;
        }
        
        const validInputRegex = /^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9])$/;
        if (!validInputRegex.test(trimmedInput)) {
            setError('Please enter a valid domain (e.g., example.com) or email address (e.g., user@example.com).');
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await analyzeInput(trimmedInput);
            setAnalysisResult(result);
        } catch (err) {
            console.error(err);
            setError('Failed to analyze input. The API may be unavailable. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [domain]);
    
    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-xl p-6 space-y-6">
             <p className="text-center text-gray-400 max-w-2xl mx-auto">
                Enter a domain or a full email address to analyze its reputation and discover common email patterns for cybersecurity validation.
            </p>
            <DomainInputForm
                domain={domain}
                setDomain={setDomain}
                onAnalyze={handleAnalyzeAddress}
                isLoading={isLoading}
            />
            {error && (
                <div className="mt-4 text-center bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg max-w-lg mx-auto" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <ResultsDisplay
                isLoading={isLoading}
                analysisResult={analysisResult}
                domain={domain}
            />
        </div>
    );
};