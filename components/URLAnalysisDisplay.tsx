import React from 'react';
import type { URLAnalysisResult, URLVerdict } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { WarningIcon } from './icons/WarningIcon';
import { QuestionMarkIcon } from './icons/QuestionMarkIcon';
import { FlagIcon } from './icons/FlagIcon';
import { InfoIcon } from './icons/InfoIcon';
import { CertificateIcon } from './icons/CertificateIcon';

interface URLAnalysisDisplayProps {
  result: URLAnalysisResult;
}

const verdictStyles: Record<URLVerdict, { icon: React.ReactNode; bgColor: string; borderColor: string; textColor: string; text: string }> = {
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

const ResultCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
      <div className="p-4 border-b border-gray-700 flex items-center gap-3">
        {icon}
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

export const URLAnalysisDisplay: React.FC<URLAnalysisDisplayProps> = ({ result }) => {
  const { overallVerdict, analysisSummary, redFlags, certificateAnalysis } = result;
  const styles = verdictStyles[overallVerdict] || verdictStyles.Unknown;

  return (
    <div className="mt-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-white">URL Analysis Report</h2>
      
      <div className={`flex items-center gap-4 p-4 rounded-lg border ${styles.bgColor} ${styles.borderColor}`}>
        {styles.icon}
        <div className="flex-grow">
          <p className={`text-2xl font-bold ${styles.textColor}`}>{styles.text}</p>
        </div>
      </div>

      <ResultCard title="AI Summary" icon={<InfoIcon className="h-6 w-6 text-cyan-400" />}>
        <p className="text-gray-300 leading-relaxed">{analysisSummary}</p>
      </ResultCard>

      {certificateAnalysis && (
        <ResultCard title="Certificate Analysis" icon={<CertificateIcon className="h-6 w-6 text-cyan-400" />}>
            <div className="space-y-4">
                <p className="text-gray-300 italic">{certificateAnalysis.summary}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-2">
                    <div>
                        <p className="text-sm font-semibold text-gray-400">Issuer</p>
                        <p className="text-lg text-white">{certificateAnalysis.issuer}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-400">Subject</p>
                        <p className="text-lg text-white break-all">{certificateAnalysis.subject}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-400">Valid From</p>
                        <p className="text-lg text-white font-mono">{certificateAnalysis.validFrom}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-400">Valid To</p>
                        <p className="text-lg text-white font-mono">{certificateAnalysis.validTo}</p>
                    </div>
                    <div className="md:col-span-2">
                        <p className="text-sm font-semibold text-gray-400">Protocol</p>
                        <p className="text-lg text-white">{certificateAnalysis.protocol}</p>
                    </div>
                </div>
            </div>
        </ResultCard>
      )}

      {redFlags && redFlags.length > 0 && (
         <ResultCard title="Identified Red Flags" icon={<FlagIcon className="h-6 w-6 text-red-400" />}>
            <ul className="space-y-3">
                {redFlags.map((flag, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <FlagIcon className="h-5 w-5 text-red-400 flex-shrink-0 mt-1" />
                        <span className="text-gray-300">{flag}</span>
                    </li>
                ))}
            </ul>
        </ResultCard>
      )}
    </div>
  );
};