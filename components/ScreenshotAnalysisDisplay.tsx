import React from 'react';
import type { ScreenshotAnalysisResult, ScreenshotVerdict } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { WarningIcon } from './icons/WarningIcon';
import { QuestionMarkIcon } from './icons/QuestionMarkIcon';
import { FlagIcon } from './icons/FlagIcon';
import { SpellCheckIcon } from './icons/SpellCheckIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface ScreenshotAnalysisDisplayProps {
  result: ScreenshotAnalysisResult;
}

const verdictStyles: Record<ScreenshotVerdict, { icon: React.ReactNode; bgColor: string; borderColor: string; textColor: string; text: string }> = {
    Safe: {
        icon: <CheckCircleIcon className="h-8 w-8 text-green-300 flex-shrink-0" />,
        bgColor: 'bg-green-900/50',
        borderColor: 'border-green-700',
        textColor: 'text-green-300',
        text: 'Appears Safe'
    },
    Suspicious: {
        icon: <WarningIcon className="h-8 w-8 text-yellow-300 flex-shrink-0" />,
        bgColor: 'bg-yellow-900/50',
        borderColor: 'border-yellow-700',
        textColor: 'text-yellow-300',
        text: 'Suspicious'
    },
    Malicious: {
        icon: <WarningIcon className="h-8 w-8 text-red-400 flex-shrink-0" />,
        bgColor: 'bg-red-900/50',
        borderColor: 'border-red-700',
        textColor: 'text-red-400',
        text: 'Potentially Malicious'
    },
    Unknown: {
        icon: <QuestionMarkIcon className="h-8 w-8 text-gray-400 flex-shrink-0" />,
        bgColor: 'bg-gray-700/50',
        borderColor: 'border-gray-600',
        textColor: 'text-gray-300',
        text: 'Verdict Unknown'
    }
};

export const ScreenshotAnalysisDisplay: React.FC<ScreenshotAnalysisDisplayProps> = ({ result }) => {
  const { overallVerdict, analysisSummary, redFlags, grammaticalAnalysis } = result;
  const styles = verdictStyles[overallVerdict] || verdictStyles.Unknown;

  return (
    <div className="mt-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-white">Screenshot Analysis Report</h2>
      
      <div className={`flex items-center gap-4 p-4 rounded-lg border ${styles.bgColor} ${styles.borderColor}`}>
        {styles.icon}
        <div className="flex-grow">
          <p className={`text-2xl font-bold ${styles.textColor}`}>{styles.text}</p>
        </div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-xl p-6 space-y-4">
        <h3 className="text-xl font-bold text-white">AI Summary</h3>
        <p className="text-gray-300 leading-relaxed">{analysisSummary}</p>
      </div>

      {redFlags && redFlags.length > 0 && (
         <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-xl p-6 space-y-4">
            <h3 className="text-xl font-bold text-white">Identified Red Flags</h3>
            <ul className="space-y-3">
                {redFlags.map((flag, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <FlagIcon className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{flag}</span>
                    </li>
                ))}
            </ul>
        </div>
      )}

      {grammaticalAnalysis && grammaticalAnalysis.errors.length > 0 && (
         <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
               <SpellCheckIcon className="h-6 w-6 text-yellow-400" />
               <h3 className="text-xl font-bold text-white">Grammatical Spot Check</h3>
            </div>
            <p className="text-gray-300 italic mt-2">{grammaticalAnalysis.summary}</p>
            <ul className="space-y-3 pt-2">
                {grammaticalAnalysis.errors.map((error, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <XCircleIcon className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-1" />
                        <span className="text-gray-300">{error}</span>
                    </li>
                ))}
            </ul>
        </div>
      )}
    </div>
  );
};