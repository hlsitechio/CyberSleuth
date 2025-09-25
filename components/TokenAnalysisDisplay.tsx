import React from 'react';
import type { TokenAnalysisResult, TokenVerdict, TokenClaim } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { WarningIcon } from './icons/WarningIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { InfoIcon } from './icons/InfoIcon';
import { FingerprintIcon } from './icons/FingerprintIcon';
import { CodeBracketIcon } from './icons/CodeBracketIcon';

interface TokenAnalysisDisplayProps {
  result: TokenAnalysisResult;
}

const verdictStyles: Record<TokenVerdict, { icon: React.ReactNode; bgColor: string; borderColor: string; textColor: string; text: string }> = {
    'Valid & Safe': {
        icon: <CheckCircleIcon className="h-8 w-8 text-green-300 flex-shrink-0" />,
        bgColor: 'bg-green-900/50',
        borderColor: 'border-green-700',
        textColor: 'text-green-300',
        text: 'Valid & Appears Safe'
    },
    'Valid & Potentially Risky': {
        icon: <WarningIcon className="h-8 w-8 text-yellow-300 flex-shrink-0" />,
        bgColor: 'bg-yellow-900/50',
        borderColor: 'border-yellow-700',
        textColor: 'text-yellow-300',
        text: 'Valid & Potentially Risky'
    },
    'Expired': {
        icon: <XCircleIcon className="h-8 w-8 text-red-400 flex-shrink-0" />,
        bgColor: 'bg-red-900/50',
        borderColor: 'border-red-700',
        textColor: 'text-red-400',
        text: 'Token is Expired'
    },
    'Invalid / Malformed': {
        icon: <XCircleIcon className="h-8 w-8 text-gray-400 flex-shrink-0" />,
        bgColor: 'bg-gray-700/50',
        borderColor: 'border-gray-600',
        textColor: 'text-gray-300',
        text: 'Invalid or Malformed Token'
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

const DecodedTokenView: React.FC<{ data: TokenClaim[] }> = ({ data }) => (
    <div className="font-mono text-sm bg-gray-900/70 p-4 rounded-lg overflow-x-auto">
        <pre><code>
            {`{\n`}
            {data.map((claim, index) => (
                <span key={index}>
                    {'  '}<span className="text-pink-400">"{claim.key}"</span>: <span className="text-teal-300">{JSON.stringify(claim.value, null, 2)}</span>{index < data.length - 1 ? ',' : ''}\n
                </span>
            ))}
            {`}`}
        </code></pre>
    </div>
);


export const TokenAnalysisDisplay: React.FC<TokenAnalysisDisplayProps> = ({ result }) => {
  const { overallVerdict, analysisSummary, securityRisks, decodedHeader, decodedPayload } = result;
  const styles = verdictStyles[overallVerdict] || verdictStyles['Invalid / Malformed'];

  return (
    <div className="mt-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-white">Auth Token Analysis Report</h2>
      
      <div className={`flex items-center gap-4 p-4 rounded-lg border ${styles.bgColor} ${styles.borderColor}`}>
        {styles.icon}
        <div className="flex-grow">
          <p className={`text-2xl font-bold ${styles.textColor}`}>{styles.text}</p>
        </div>
      </div>

      <ResultCard title="AI Summary" icon={<InfoIcon className="h-6 w-6 text-cyan-400" />}>
        <p className="text-gray-300 leading-relaxed">{analysisSummary}</p>
      </ResultCard>

      {securityRisks && securityRisks.length > 0 && (
         <ResultCard title="Security Analysis & Red Flags" icon={<FingerprintIcon className="h-6 w-6 text-red-400" />}>
            <ul className="space-y-3">
                {securityRisks.map((risk, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <WarningIcon className="h-5 w-5 text-red-400 flex-shrink-0 mt-1" />
                        <span className="text-gray-300">{risk}</span>
                    </li>
                ))}
            </ul>
        </ResultCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {decodedHeader && decodedHeader.length > 0 && (
            <ResultCard title="Decoded Header" icon={<CodeBracketIcon className="h-6 w-6 text-cyan-400" />}>
                <DecodedTokenView data={decodedHeader} />
            </ResultCard>
        )}

        {decodedPayload && decodedPayload.length > 0 && (
            <ResultCard title="Decoded Payload" icon={<CodeBracketIcon className="h-6 w-6 text-cyan-400" />}>
                <DecodedTokenView data={decodedPayload} />
            </ResultCard>
        )}
      </div>
    </div>
  );
};
