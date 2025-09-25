import React from 'react';
import type { SecretAnalysisResult, SecretVerdict, FoundSecret } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { WarningIcon } from './icons/WarningIcon';
import { InfoIcon } from './icons/InfoIcon';
import { QuestionMarkIcon } from './icons/QuestionMarkIcon';

interface SecretAnalysisDisplayProps {
  result: SecretAnalysisResult;
}

const verdictStyles: Record<SecretVerdict, { icon: React.ReactNode; bgColor: string; borderColor: string; textColor: string; text: string }> = {
    'No Secrets Found': { icon: <CheckCircleIcon className="h-8 w-8 text-green-300 flex-shrink-0" />, bgColor: 'bg-green-900/50', borderColor: 'border-green-700', textColor: 'text-green-300', text: 'No Secrets Found'},
    'Secrets Found': { icon: <WarningIcon className="h-8 w-8 text-red-400 flex-shrink-0" />, bgColor: 'bg-red-900/50', borderColor: 'border-red-700', textColor: 'text-red-400', text: 'Secrets Found' },
    'Analysis Incomplete': { icon: <QuestionMarkIcon className="h-8 w-8 text-gray-400 flex-shrink-0" />, bgColor: 'bg-gray-700/50', borderColor: 'border-gray-600', textColor: 'text-gray-300', text: 'Analysis Incomplete' }
};

const riskColors: Record<FoundSecret['risk'], string> = {
    'Critical': 'bg-red-500 text-red-900',
    'High': 'bg-orange-500 text-orange-900',
    'Medium': 'bg-yellow-500 text-yellow-900',
    'Low': 'bg-blue-500 text-blue-900'
}

export const SecretAnalysisDisplay: React.FC<SecretAnalysisDisplayProps> = ({ result }) => {
  const { overallVerdict, analysisSummary, foundSecrets } = result;
  const styles = verdictStyles[overallVerdict] || verdictStyles['Analysis Incomplete'];

  return (
    <div className="mt-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-white">Secret Scanner Report</h2>
      
      <div className={`flex items-center gap-4 p-4 rounded-lg border ${styles.bgColor} ${styles.borderColor}`}>
        {styles.icon}
        <p className={`text-2xl font-bold ${styles.textColor}`}>{styles.text}</p>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-xl p-6">
        <div className="flex items-center gap-3">
            <InfoIcon className="h-6 w-6 text-cyan-400" />
            <h3 className="text-xl font-bold text-white">AI Summary</h3>
        </div>
        <p className="text-gray-300 leading-relaxed mt-3">{analysisSummary}</p>
      </div>

      {foundSecrets && foundSecrets.length > 0 && (
         <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
             <div className="p-4 border-b border-gray-700 flex items-center gap-3">
                <WarningIcon className="h-6 w-6 text-red-400" />
                <h3 className="text-xl font-bold text-white">Findings</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-900/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Line</th>
                            <th scope="col" className="px-6 py-3">Type</th>
                            <th scope="col" className="px-6 py-3">Risk</th>
                            <th scope="col" className="px-6 py-3">Snippet</th>
                        </tr>
                    </thead>
                    <tbody>
                        {foundSecrets.map((secret, index) => (
                            <tr key={index} className="border-b border-gray-700 hover:bg-gray-800/60">
                                <td className="px-6 py-4 font-mono">{secret.line}</td>
                                <td className="px-6 py-4">{secret.type}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${riskColors[secret.risk]}`}>
                                        {secret.risk}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-mono text-pink-400">{secret.snippet}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};
