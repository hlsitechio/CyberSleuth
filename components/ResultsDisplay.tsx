import React from 'react';
import { LoaderIcon } from './icons/LoaderIcon';
import { InfoIcon } from './icons/InfoIcon';
import { AliasIcon } from './icons/AliasIcon';
import { FormatIcon } from './icons/FormatIcon';
import { LinkIcon } from './icons/LinkIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { WarningIcon } from './icons/WarningIcon';
import { QuestionMarkIcon } from './icons/QuestionMarkIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import type { DomainAnalysisResult, LegitimacyStatus } from '../types';
import { EnvelopeIcon } from './icons/EnvelopeIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';

interface ResultsDisplayProps {
  isLoading: boolean;
  analysisResult: DomainAnalysisResult | null;
  domain: string;
}

const legitimacyStyles: Record<LegitimacyStatus, { icon: React.ReactNode; bgColor: string; borderColor: string; textColor: string; text: string }> = {
    Legitimate: {
        icon: <CheckCircleIcon className="h-8 w-8 text-green-300 flex-shrink-0" />,
        bgColor: 'bg-green-900/50',
        borderColor: 'border-green-700',
        textColor: 'text-green-300',
        text: 'Appears Legitimate'
    },
    Suspicious: {
        icon: <WarningIcon className="h-8 w-8 text-yellow-300 flex-shrink-0" />,
        bgColor: 'bg-yellow-900/50',
        borderColor: 'border-yellow-700',
        textColor: 'text-yellow-300',
        text: 'Suspicious'
    },
    'Potentially Malicious': {
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
        text: 'Legitimacy Unknown'
    }
};

const ResultCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-xl overflow-hidden h-full flex flex-col">
    <div className="p-4 border-b border-gray-700 flex items-center gap-3">
      {icon}
      <h3 className="text-xl font-bold text-white">{title}</h3>
    </div>
    <div className="p-4 flex-grow">
      {children}
    </div>
  </div>
);

const highlightEmail = (text: string, emailToHighlight?: string): React.ReactNode => {
    if (!emailToHighlight || !text || !text.toLowerCase().includes(emailToHighlight.toLowerCase())) {
        return text;
    }
    const parts = text.split(new RegExp(`(${emailToHighlight})`, 'gi'));
    return (
        <>
            {parts.map((part, index) =>
                part.toLowerCase() === emailToHighlight.toLowerCase() ? (
                    <span key={index} className="text-cyan-400 underline font-semibold">
                        {part}
                    </span>
                ) : (
                    part
                )
            )}
        </>
    );
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ isLoading, analysisResult, domain }) => {
  if (isLoading) {
    return (
      <div className="mt-12 text-center">
        <LoaderIcon className="h-12 w-12 text-cyan-400 mx-auto animate-spin" />
        <p className="mt-4 text-lg text-gray-400">Performing deep analysis on {domain}... This may take a moment.</p>
      </div>
    );
  }

  if (!analysisResult) {
    return null;
  }

  const { legitimacy, reputationSummary, commonAliases, observedFormats, otherDiscoveredEmails, sources, specificEmailAnalysis, sourcesSummary } = analysisResult;
  const styles = legitimacyStyles[legitimacy] || legitimacyStyles.Unknown;
  const emailToHighlight = domain.includes('@') ? domain : undefined;

  return (
    <div className="mt-12 max-w-6xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-center text-white">Analysis Report for <span className="text-cyan-400 break-all">{domain}</span></h2>
      
      <div className={`flex items-start gap-4 p-4 rounded-lg border ${styles.bgColor} ${styles.borderColor}`}>
        {styles.icon}
        <div className="flex-grow">
          <p className={`text-2xl font-bold ${styles.textColor}`}>{styles.text}</p>
          <p className="text-gray-400 text-sm">This verdict is based on a real-time web analysis of the input.</p>
        </div>
      </div>

      {specificEmailAnalysis && (
        <div className="space-y-4">
            <div className={`flex items-start gap-4 p-4 rounded-lg border ${specificEmailAnalysis.isVerified ? 'bg-green-900/50 border-green-700' : 'bg-yellow-900/50 border-yellow-700'}`}>
                {specificEmailAnalysis.isVerified 
                    ? <CheckCircleIcon className="h-8 w-8 text-green-300 flex-shrink-0 mt-1" />
                    : <XCircleIcon className="h-8 w-8 text-yellow-300 flex-shrink-0 mt-1" />
                }
                <div className="flex-grow">
                    <p className={`text-xl font-bold ${specificEmailAnalysis.isVerified ? 'text-green-300' : 'text-yellow-300'}`}>
                        {specificEmailAnalysis.isVerified ? 'Email Address Verified' : 'Email Address Not Verified'}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">{highlightEmail(specificEmailAnalysis.summary, emailToHighlight)}</p>
                </div>
            </div>
             {!specificEmailAnalysis.isVerified && specificEmailAnalysis.foundSuggestion && (
                 <div className="flex items-start gap-4 p-4 rounded-lg border bg-yellow-900/50 border-yellow-700">
                    <WarningIcon className="h-6 w-6 text-yellow-300 flex-shrink-0 mt-0.5" />
                    <div className="flex-grow">
                        <p className="font-bold text-yellow-200">Typo Alert & Potential Phishing Vector</p>
                        <p className="text-gray-300 mt-1">
                            The analyzed email was not found. A very similar address exists, which is a common tactic for phishing attacks.
                        </p>
                        <p className="text-gray-300 mt-2">
                            Suggested correct address: <strong className="font-mono text-cyan-300">{specificEmailAnalysis.foundSuggestion}</strong>
                        </p>
                    </div>
                </div>
            )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
           <ResultCard title="Reputation Summary" icon={<InfoIcon className="h-6 w-6 text-cyan-400" />}>
              <p className="text-gray-300 leading-relaxed">{highlightEmail(reputationSummary, emailToHighlight)}</p>
           </ResultCard>
        </div>
        <div className="lg:col-span-3 space-y-8">
            <ResultCard title="Common Public Aliases" icon={<AliasIcon className="h-6 w-6 text-cyan-400" />}>
                {commonAliases.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {commonAliases.map((email, index) => (
                        <div key={index} className="bg-gray-900/60 p-3 rounded-md border border-gray-600 font-mono text-sm text-gray-300 tracking-wide hover:bg-gray-700/50 hover:border-cyan-500 transition-all duration-200 break-all">
                            {highlightEmail(email, emailToHighlight)}
                        </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400">No common public aliases were identified.</p>
                )}
            </ResultCard>
            <ResultCard title="Observed Email Formats" icon={<FormatIcon className="h-6 w-6 text-cyan-400" />}>
                {observedFormats.length > 0 ? (
                     <div className="flex flex-col gap-3">
                        {observedFormats.map((format, index) => (
                        <div key={index} className="bg-gray-900/60 p-3 rounded-md border border-gray-600 font-mono text-sm text-gray-300 tracking-wide">
                           {highlightEmail(format, emailToHighlight)}
                        </div>
                        ))}
                    </div>
                ) : (
                     <p className="text-gray-400">No specific email formats could be determined from public sources.</p>
                )}
            </ResultCard>
        </div>
      </div>

      <ResultCard title="Other Emails Found" icon={<EnvelopeIcon className="h-6 w-6 text-cyan-400" />}>
        {otherDiscoveredEmails && otherDiscoveredEmails.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {otherDiscoveredEmails.map((email, index) => (
                <div key={index} className="bg-gray-900/60 p-3 rounded-md border border-gray-600 font-mono text-sm text-gray-300 tracking-wide hover:bg-gray-700/50 hover:border-cyan-500 transition-all duration-200 break-all">
                    {highlightEmail(email, emailToHighlight)}
                </div>
                ))}
            </div>
        ) : (
             <p className="text-gray-400">No other public emails were discovered for this domain.</p>
        )}
      </ResultCard>

      {sources && sources.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Sources</h3>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
            {sources.map((source, index) => (
              <a 
                key={index} 
                href={source.uri} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 text-cyan-400 hover:text-cyan-300 hover:underline transition-colors duration-200 group"
              >
                <LinkIcon className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-cyan-300" />
                <span className="truncate">{source.title || source.uri}</span>
              </a>
            ))}
          </div>
           {sourcesSummary && (
             <div className="mt-4 bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">Source Information Summary</h4>
                <p className="text-gray-400 italic">
                    {highlightEmail(sourcesSummary, emailToHighlight)}
                </p>
             </div>
          )}
        </div>
      )}
    </div>
  );
};