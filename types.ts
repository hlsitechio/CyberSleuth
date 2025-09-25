export interface GroundingSource {
  uri: string;
  title: string;
}

export type LegitimacyStatus = 'Legitimate' | 'Suspicious' | 'Potentially Malicious' | 'Unknown';

export interface SpecificEmailAnalysis {
  email: string;
  isVerified: boolean;
  summary: string;
  foundSuggestion?: string;
}

export interface DomainAnalysisResult {
  legitimacy: LegitimacyStatus;
  reputationSummary: string;
  commonAliases: string[];
  observedFormats: string[];
  otherDiscoveredEmails?: string[];
  sources: GroundingSource[];
  sourcesSummary?: string;
  specificEmailAnalysis?: SpecificEmailAnalysis;
}

// Types for Screenshot Analysis
export type ScreenshotVerdict = 'Safe' | 'Suspicious' | 'Malicious' | 'Unknown';

export interface GrammaticalError {
  summary: string;
  errors: string[];
}

export interface ScreenshotAnalysisResult {
  overallVerdict: ScreenshotVerdict;
  analysisSummary: string;
  redFlags: string[];
  grammaticalAnalysis?: GrammaticalError;
}

// Types for URL Analysis
export type URLVerdict = 'Safe' | 'Suspicious' | 'Malicious' | 'Unknown';

export interface CertificateAnalysis {
  issuer: string;
  subject: string;
  validFrom: string;
  validTo: string;
  protocol: string;
  summary: string;
}

export interface URLAnalysisResult {
  overallVerdict: URLVerdict;
  analysisSummary: string;
  redFlags: string[];
  certificateAnalysis?: CertificateAnalysis;
}

// Types for Auth Token Analysis
export type TokenVerdict = 'Valid & Safe' | 'Valid & Potentially Risky' | 'Invalid / Malformed' | 'Expired';

export interface TokenClaim {
    key: string;
    value: any;
}

export interface TokenAnalysisResult {
    overallVerdict: TokenVerdict;
    analysisSummary: string;
    securityRisks: string[];
    decodedHeader: TokenClaim[];
    decodedPayload: TokenClaim[];
}

// Types for Secret Scanner
export type SecretVerdict = 'No Secrets Found' | 'Secrets Found' | 'Analysis Incomplete';

export interface FoundSecret {
  line: number;
  type: string;
  snippet: string;
  risk: 'Critical' | 'High' | 'Medium' | 'Low';
  suggestion: string;
}

export interface SecretAnalysisResult {
  overallVerdict: SecretVerdict;
  analysisSummary: string;
  foundSecrets: FoundSecret[];
}

// Types for Raw Email Analysis
export type RawEmailVerdict = 'Safe' | 'Suspicious' | 'Malicious' | 'Spam' | 'Unknown';

export interface HeaderAnalysis {
  from: string;
  subject: string;
  dkim: string;
  spf: string;
  dmarc: string;
  summary: string;
}

export interface LinkAnalysis {
  url: string;
  verdict: 'Safe' | 'Suspicious';
  summary: string;
}

export interface AttachmentAnalysis {
  filename: string;
  risk: 'High' | 'Medium' | 'Low' | 'None';
  summary: string;
}

export interface RawEmailAnalysisResult {
  overallVerdict: RawEmailVerdict;
  analysisSummary: string;
  redFlags: string[];
  headerAnalysis: HeaderAnalysis;
  links: LinkAnalysis[];
  attachments: AttachmentAnalysis[];
}
