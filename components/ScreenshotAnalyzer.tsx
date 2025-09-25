import React, { useState, useCallback, useRef, useEffect } from 'react';
import { analyzeEmailScreenshot } from '../services/geminiService';
import type { ScreenshotAnalysisResult } from '../types';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { LoaderIcon } from './icons/LoaderIcon';
import { ScreenshotAnalysisDisplay } from './ScreenshotAnalysisDisplay';

export const ScreenshotAnalyzer: React.FC = () => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<ScreenshotAnalysisResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePasteEvent = useCallback((event: ClipboardEvent) => {
        if (imageSrc || isLoading) return;

        setError(null);
        setAnalysisResult(null);

        const items = event.clipboardData?.items;
        if (!items) {
            setError('Could not access clipboard data. Your browser might not support this feature.');
            return;
        }

        let imageFile: File | null = null;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
                imageFile = items[i].getAsFile();
                break;
            }
        }
        
        if (imageFile) {
            event.preventDefault();

            const reader = new FileReader();
            reader.onloadend = () => {
                setImageSrc(reader.result as string);
            };
            reader.onerror = () => {
                setError('An error occurred while reading the pasted image.');
            };
            reader.readAsDataURL(imageFile);
        }
    }, [imageSrc, isLoading]);

    useEffect(() => {
        window.addEventListener('paste', handlePasteEvent);
        return () => {
            window.removeEventListener('paste', handlePasteEvent);
        };
    }, [handlePasteEvent]);
    
    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setAnalysisResult(null);
        setImageSrc(null);

        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Invalid file type. Please select an image file (e.g., PNG, JPG, WEBP).');
            if (event.target) event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImageSrc(reader.result as string);
        };
        reader.onerror = () => {
            setError('An error occurred while reading the file.');
        };
        reader.readAsDataURL(file);

        if (event.target) event.target.value = '';
    }, []);

    const handleAnalyze = async () => {
        if (!imageSrc) {
            setError('No image to analyze. Please paste an image first.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const match = imageSrc.match(/data:(.*);base64,(.*)/);
            if (!match) {
                throw new Error('Invalid image data URL format.');
            }
            const [, mimeType, base64Data] = match;

            const result = await analyzeEmailScreenshot(base64Data, mimeType);
            setAnalysisResult(result);
        } catch (err) {
            console.error(err);
            setError('Failed to analyze screenshot. The API may be unavailable. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReset = () => {
        setImageSrc(null);
        setAnalysisResult(null);
        setError(null);
        setIsLoading(false);
    }

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-xl p-6 space-y-6">
            <p className="text-center text-gray-400">
                Paste a screenshot of a suspicious email to get an instant AI-powered security analysis.
             </p>

            {!imageSrc && (
                <div 
                    className="relative block w-full rounded-lg border-2 border-dashed border-gray-600 p-12 text-center hover:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    aria-label="Paste image from clipboard or upload a file"
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <ClipboardIcon className="mx-auto h-12 w-12 text-gray-500" />
                    <span className="mt-4 block text-lg font-semibold text-gray-300">
                        Press Ctrl+V to paste an image or{' '}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                            }}
                            className="font-semibold bg-transparent border-none p-0 text-cyan-400 hover:text-cyan-300 focus:outline-none focus:underline cursor-pointer"
                        >
                            Browse Files
                        </button>
                    </span>
                    <p className="mt-1 text-sm text-gray-500">You can paste an image directly from your clipboard.</p>
                </div>
            )}

            {imageSrc && (
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 space-y-4">
                    <p className="text-xl font-bold text-white">Image Preview</p>
                    <div className="max-h-96 overflow-auto rounded-md border border-gray-600">
                         <img src={imageSrc} alt="Email screenshot preview" className="w-full h-auto object-contain rounded-md" />
                    </div>
                    <div className="flex gap-4">
                         <button
                            type="button"
                            onClick={handleAnalyze}
                            disabled={isLoading}
                            className="flex-grow bg-cyan-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            {isLoading ? 'Analyzing...' : 'Analyze Screenshot'}
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={isLoading}
                            className="bg-gray-700 text-white font-semibold py-3 px-8 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500 transition-colors duration-200"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}
            
            {error && (
                <div className="mt-4 text-center bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg max-w-lg mx-auto" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            
            {isLoading && (
                 <div className="mt-8 text-center">
                    <LoaderIcon className="h-12 w-12 text-cyan-400 mx-auto animate-spin" />
                    <p className="mt-4 text-lg text-gray-400">Performing deep content analysis on the image...</p>
                </div>
            )}

            {analysisResult && (
                <ScreenshotAnalysisDisplay result={analysisResult} />
            )}
        </div>
    );
};