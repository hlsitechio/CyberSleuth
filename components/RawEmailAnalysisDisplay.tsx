import React from 'react';
import type { RawEmailAnalysisResult, RawEmailVerdict } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { WarningIcon } from './icons/WarningIcon';
import { QuestionMarkIcon } from './icons/QuestionMarkIcon';
import { FlagIcon } from './icons/FlagIcon';
import { InfoIcon } from './icons/InfoIcon';
import { ShieldIcon } from './icons/ShieldIcon';
import { LinkIcon } from './icons/LinkIcon';
import { PaperClipIcon } from './icons/PaperClipIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface RawEmailAnalysisDisplayProps {
  result: RawEmailAnalysisResult;
}

const verdictStyles: Record<RawEmailVerdict, { icon: React.ReactNode; bgColor: string; borderColor: string; textColor: string; text: string }> = {
    Safe: { icon: <CheckCircleIcon className="h-8 w-8 text-green-300 flex-shrink-0" />, bgColor: 'bg-green-900/50', borderColor: 'border-green-700', textColor: 'text-green-300', text: 'Appears Safe'},
    Suspicious: { icon: <WarningIcon className="h-8 w-8 text-yellow-300 flex-shrink-0" />, bgColor: 'bg-yellow-900/50', borderColor: 'border-yellow-700', textColor: 'text-yellow-300', text: 'Suspicious' },
    Malicious: { icon: <WarningIcon className="h-8 w-8 text-red-400 flex-shrink-0" />, bgColor: 'bg-red-900/50', borderColor: 'border-red-700', textColor: 'text-red-400', text: 'Potentially Malicious' },
    Spam: { icon: <XCircleIcon className="h-8 w-8 text-orange-400 flex-shrink-0" />, bgColor: 'bg-orange-900/50', borderColor: 'border-orange-700', textColor: 'text-orange-400', text: 'Likely Spam' },
    Unknown: { icon: <QuestionMarkIcon className="h-8 w-8 text-gray-400 flex-shrink-0" />, bgColor: 'bg-gray-700/50', borderColor: 'border-gray-600', textColor: 'text-gray-300', text: 'Verdict Unknown' }
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

const AuthStatus: React.FC<{ status: string }> = ({ status }) => {
    const s = status.toLowerCase();
    if (s.includes('pass')) {
        return <span className="font-bold text-green-400">{status}</span>;
    }
    if (s.includes('fail')) {
        return <span className="font-bold text-red-400">{status}</span>;
    }
    if (s.includes('softfail') || s.includes('neutral')) {
        return <span className="font-bold text-yellow-400">{status}</span>
    }
    return <span className="text-gray-400">{status}</span>;
};

export const RawEmailAnalysisDisplay: React.FC<RawEmailAnalysisDisplayProps> = ({ result }) => {
  const { overallVerdict, analysisSummary, redFlags, headerAnalysis, links, attachments } = result;
  const styles = verdictStyles[overallVerdict] || verdictStyles.Unknown;

  return (
    <div className="mt-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-white">Raw Email Analysis Report</h2>
      
      <div className={`flex items-center gap-4 p-4 rounded-lg border ${styles.bgColor} ${styles.borderColor}`}>
        {styles.icon}
        <p className={`text-2xl font-bold ${styles.textColor}`}>{styles.text}</p>
      </div>

      <ResultCard title="AI Summary" icon={<InfoIcon className="h-6 w-6 text-cyan-400" />}>
        <p className="text-gray-300 leading-relaxed">{analysisSummary}</p>
      </ResultCard>

      {redFlags && redFlags.length > 0 && (
         <ResultCard title="Identified Red Flags" icon={<FlagIcon className="h-6 w-6 text-red-400" />}>
            <ul className="space-y-3">
                {redFlags.map((flag, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <WarningIcon className="h-5 w-5 text-red-400 flex-shrink-0 mt-1" />
                        <span className="text-gray-300">{flag}</span>
                    </li>
                ))}
            </ul>
        </ResultCard>
      )}

      {headerAnalysis && (
        <ResultCard title="Header & Authentication Analysis" icon={<ShieldIcon className="h-6 w-6 text-cyan-400" />}>
            <div className="space-y-4">
                <p className="text-gray-300 italic">{headerAnalysis.summary}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-2 font-mono text-sm">
                    <div><p className="text-gray-400">From:</p><p className="text-white break-all">{headerAnalysis.from}</p></div>
                    <div><p className="text-gray-400">Subject:</p><p className="text-white break-all">{headerAnalysis.subject}</p></div>
                    <div><p className="text-gray-400">DKIM:</p><p><AuthStatus status={headerAnalysis.dkim} /></p></div>
                    <div><p className="text-gray-400">SPF:</p><p><AuthStatus status={headerAnalysis.spf} /></p></div>
                    <div className="sm:col-span-2"><p className="text-gray-400">DMARC:</p><p><AuthStatus status={headerAnalysis.dmarc} /></p></div>
                </div>
            </div>
        </ResultCard>
      )}

      {links && links.length > 0 && (
         <ResultCard title="Link Analysis" icon={<LinkIcon className="h-6 w-6 text-cyan-400" />}>
            <div className="space-y-4">
                {links.map((link, index) => (
                    <div key={index} className="p-3 bg-gray-900/50 border border-gray-700 rounded-md">
                        <div className="flex items-center gap-2">
                           {link.verdict === 'Suspicious' ? <WarningIcon className="h-5 w-5 text-yellow-300" /> : <CheckCircleIcon className="h-5 w-5 text-green-300" />}
                           <p className="font-mono text-cyan-400 text-sm break-all">{link.url}</p>
                        </div>
                        <p className="text-gray-300 mt-2 text-sm">{link.summary}</p>
                    </div>
                ))}
            </div>
        </ResultCard>
      )}

      {attachments && attachments.length > 0 && (
         <ResultCard title="Attachment Analysis" icon={<PaperClipIcon className="h-6 w-6 text-cyan-400" />}>
            <div className="space-y-4">
                {attachments.map((att, index) => (
                    <div key={index} className="p-3 bg-gray-900/50 border border-gray-700 rounded-md">
                        <div className="flex items-center gap-2">
                            {att.risk === 'High' && <WarningIcon className="h-5 w-5 text-red-400" />}
                            {att.risk === 'Medium' && <WarningIcon className="h-5 w-5 text-yellow-300" />}
                            {att.risk === 'Low' && <InfoIcon className="h-5 w-5 text-blue-300" />}
                            {att.risk === 'None' && <CheckCircleIcon className="h-5 w-5 text-green-300" />}
                           <p className="font-mono text-white text-sm break-all">{att.filename}</p>
                           <span className="ml-auto text-xs font-semibold px-2 py-1 bg-gray-700 rounded-full">{att.risk} Risk</span>
                        </div>
                        <p className="text-gray-300 mt-2 text-sm">{att.summary}</p>
                    </div>
                ))}
            </div>
        </ResultCard>
      )}

    </div>
  );
};
