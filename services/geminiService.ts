import { GoogleGenAI } from "@google/genai";
import type { DomainAnalysisResult, GroundingSource, LegitimacyStatus, ScreenshotAnalysisResult, ScreenshotVerdict, URLAnalysisResult, URLVerdict, TokenAnalysisResult, TokenVerdict, SecretAnalysisResult, SecretVerdict, RawEmailAnalysisResult, RawEmailVerdict } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeInput(input: string): Promise<DomainAnalysisResult> {
  const isEmail = input.includes('@');
  const domain = isEmail ? input.split('@').pop()! : input;
  const localPart = isEmail ? input.split('@')[0] : null;

  const specificAnalysisPrompt = localPart 
    ? `
    3. **Specific Email Verification (CRITICAL SECURITY CHECK)**: The user provided a full email address ("${input}"). This is the most critical task.
        - **Typosquatting Detection**: This is a primary phishing vector. Pay extreme attention to every character.
        - If the user's *exact* email address is NOT publicly documented, but a very similar one is (e.g., user entered 'response@ccts-cprsti.ca' but 'response@ccts-cprst.ca' is the correct one), you MUST treat this as a high-risk indicator.
        - In this typo scenario, you MUST:
          a. Set 'isVerified' to false.
          b. Set the overall 'legitimacy' to 'Potentially Malicious'.
          c. Write a 'summary' explaining that while the domain is real, the specific email is not, and this is a common phishing tactic.
          d. Provide the correct, verified email address in the 'foundSuggestion' field.
        - If the exact email is found and verified, set 'isVerified' to true.
    ` 
    : '';
  
  const specificAnalysisSchema = localPart
    ? `"specificEmailAnalysis": { "isVerified": boolean, "summary": "A concise explanation of the finding for the specific email address '${input}'.", "foundSuggestion": "If a typo was detected and a correct email was found, provide it here. Otherwise, null." },`
    : '';

  const prompt = `
    Act as an OSINT (Open-Source Intelligence) cybersecurity analyst. You have access to real-time threat intelligence databases for phishing, malware, and spam. Your mission is to perform a detailed analysis of the input "${input}" to uncover its public email footprint and assess its legitimacy with a high degree of certainty.

    Your process should be:
    1. **Threat Intelligence Cross-Reference**: Immediately check the domain "${domain}" against your threat databases. Any matches for phishing or malware must heavily influence the final verdict, making it 'Potentially Malicious'.
    2. **Deep Web Analysis**: Analyze the official website for "${domain}" and other reputable public sources to corroborate findings about the organization's legitimacy and common email practices.
    ${specificAnalysisPrompt}

    Based on this deep analysis, provide a response in a single, valid JSON object format. The JSON object must have the following structure and content:
    {
      "legitimacy": "A classification: 'Legitimate', 'Suspicious', 'Potentially Malicious', or 'Unknown'. This must be influenced by the specific email verification if one was requested.",
      "reputationSummary": "A concise summary of the domain's reputation, explicitly mentioning if it's found in threat databases. Confirm its business, age, and any red flags.",
      ${specificAnalysisSchema}
      "commonAliases": [
        "An array of specific, public-facing email aliases discovered for this domain (e.g., 'noreply@', 'privacy@'). Do NOT include any private or individual employee emails."
      ],
      "observedFormats": [
        "An array of common email address formats observed for this organization (e.g., 'firstname.lastname@${domain}')."
      ],
      "otherDiscoveredEmails": [
        "An array of any other publicly discoverable email addresses associated with the domain. Exclude personal employee emails unless they are clearly public contact points."
      ],
      "sourcesSummary": "A brief, one-sentence summary of the types of websites consulted to generate this report."
    }

    Ensure the final output is ONLY the JSON object, without any markdown formatting or extraneous text. If a category yields no results, provide an empty array.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{googleSearch: {}}],
    },
  });

  const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  const sources: GroundingSource[] = rawChunks
      .map((chunk: any) => ({
          uri: chunk.web?.uri || '',
          title: chunk.web?.title || `Source from ${domain}`,
      }))
      .filter((source: GroundingSource) => source.uri);

  const textResponse = response.text;
  
  try {
    const cleanedText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedResult = JSON.parse(cleanedText);
    
    const validLegitimacy: LegitimacyStatus[] = ['Legitimate', 'Suspicious', 'Potentially Malicious', 'Unknown'];
    if (!validLegitimacy.includes(parsedResult.legitimacy)) {
        parsedResult.legitimacy = 'Unknown';
    }
    
    parsedResult.commonAliases = parsedResult.commonAliases || [];
    parsedResult.observedFormats = parsedResult.observedFormats || [];
    parsedResult.otherDiscoveredEmails = parsedResult.otherDiscoveredEmails || [];
    parsedResult.commonAliases.sort();
    parsedResult.observedFormats.sort();
    parsedResult.otherDiscoveredEmails.sort();

    if (parsedResult.specificEmailAnalysis) {
        parsedResult.specificEmailAnalysis.email = input;
    }

    return { ...parsedResult, sources };
  } catch (error) {
    console.error("Failed to parse Gemini API JSON response:", error, "Raw response:", textResponse);
    return {
      legitimacy: 'Unknown',
      reputationSummary: `An error occurred while parsing the analysis, but here is the raw output: ${textResponse}`,
      commonAliases: [],
      observedFormats: [],
      otherDiscoveredEmails: [],
      sources: sources,
    };
  }
}


export async function analyzeEmailScreenshot(base64Data: string, mimeType: string): Promise<ScreenshotAnalysisResult> {
  const prompt = `
    You are a cybersecurity expert specializing in phishing and spam detection. Analyze the provided email screenshot for any signs of malicious intent.

    Your process must be:
    1.  **Examine the Sender:** Look at the sender's email address and display name. Check for typosquatting (e.g., 'micosoft' instead of 'microsoft'), unprofessional names, or use of a public domain for a supposedly official email.
    2.  **Analyze the Subject Line:** Check for unusual urgency, strange characters, or generic greetings.
    3.  **Identify Social Engineering Tactics:**
        - **Urgency and Fear:** Look for urgent calls to action (e.g., "verify your account immediately"), threats, or deadlines.
        - **Alarming Details (Critical):** Scan for geopolitical details like countries (e.g., Russia, China, Nigeria), specific IP addresses, or unfamiliar locations mentioned in security alerts. Mentioning these is a classic tactic to scare the user into immediate, panicked action. This is a major red flag.
    4.  **Inspect Links and Buttons:** Check if any visible links seem suspicious (e.g., shortened URLs, mismatched anchor text and destination). Scrutinize call-to-action buttons like "Reset Password".
    5.  **Grammatical Spot Check (Vision):** Carefully read all text in the image. Identify spelling mistakes, grammatical errors, and awkward or unprofessional phrasing. These are very common red flags in phishing emails.
    6.  **Overall Assessment:** Combine all these factors to determine the email's likely intent.

    Provide your analysis as a single, valid JSON object. The JSON object must have the following structure:
    {
      "overallVerdict": "A classification: 'Safe', 'Suspicious', 'Malicious', or 'Unknown'.",
      "analysisSummary": "A concise, one or two-sentence summary of your findings and recommendation to the user.",
      "redFlags": [
        "An array of strings, where each string is a specific red flag you identified in the email (e.g., 'Sender uses a typosquatted domain 'micosoft.com'.', 'Uses alarming details (e.g., login from Russia) to provoke a hasty, emotional reaction.', 'The email contains spelling and grammatical errors.', 'Creates a false sense of urgency.')."
      ],
      "grammaticalAnalysis": {
        "summary": "A one-sentence summary of the text's quality (e.g., 'The email contains several spelling and grammatical errors.' or 'The text appears to be well-written.').",
        "errors": [
          "An array of strings, each detailing a specific grammatical or spelling mistake found (e.g., 'Misspelled 'sincerely' as 'sincerly'.', 'Awkward phrasing: 'your account will be suspend'.')."
        ]
      }
    }

    Ensure the final output is ONLY the JSON object, without any markdown formatting or extraneous text. If no red flags or grammatical errors are found, provide empty arrays for those fields.
  `;

  const imagePart = {
    inlineData: {
      mimeType,
      data: base64Data,
    },
  };

  const textPart = {
    text: prompt
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
  });

  const textResponse = response.text;

  try {
    const cleanedText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedResult = JSON.parse(cleanedText);

    const validVerdicts: ScreenshotVerdict[] = ['Safe', 'Suspicious', 'Malicious', 'Unknown'];
    if (!validVerdicts.includes(parsedResult.overallVerdict)) {
        parsedResult.overallVerdict = 'Unknown';
    }
    
    parsedResult.redFlags = parsedResult.redFlags || [];
    
    return parsedResult;
  } catch (error) {
    console.error("Failed to parse Gemini API JSON response for screenshot:", error, "Raw response:", textResponse);
    return {
      overallVerdict: 'Unknown',
      analysisSummary: `An error occurred while parsing the analysis. The AI model may have provided a response in an unexpected format. Raw output: ${textResponse}`,
      redFlags: [],
    };
  }
}

export async function analyzeUrl(url: string): Promise<URLAnalysisResult> {
  const prompt = `
    You are a specialized AI agent acting as a cybersecurity expert focused on malicious URL detection. You have access to real-time threat intelligence databases and advanced sandboxing environments for analysis. Your task is to analyze the following URL and determine if it is malicious: "${url}"

    Your analysis process MUST follow these steps:
    1.  **URL Deconstruction:** Break down the URL into its components (protocol, subdomain, domain, TLD, path, query parameters). Look for red flags like excessive subdomains, IP addresses instead of domains, use of URL shorteners, or suspicious keywords (e.g., 'login', 'verify', 'account').
    2.  **Threat Intelligence Check:** Cross-reference the domain and IP address against known blocklists for phishing, malware, and spam.
    3.  **WHOIS & Detailed Certificate Analysis:**
        - Analyze the domain's registration age (newly registered domains are a major red flag).
        - Perform a deep analysis of the SSL/TLS certificate. You MUST extract the following details:
            - **Issuer:** The Certificate Authority (CA) that issued the certificate (e.g., "Let's Encrypt", "DigiCert Inc").
            - **Subject:** The common name or domain the certificate is issued to (e.g., "example.com").
            - **Validity Period:** The "valid from" and "valid to" dates in "YYYY-MM-DD" format.
            - **Protocol:** The TLS/SSL protocol version (e.g., "TLS 1.3").
        - **Certificate Red Flags:** A mismatch between the subject and the URL's domain, a very recent expiry date, a self-signed certificate, or an issuer with a poor reputation are all critical red flags. Your summary should reflect this.
    4.  **Content & Behavior Analysis (Simulated):** Based on search results and public information, infer the purpose of the page. Does it host a known brand's login page? Does it use deceptive tactics? Are there reports of it forcing downloads or running malicious scripts?
    5.  **Final Verdict Formulation:** Synthesize all findings into a clear verdict.

    Provide your analysis as a single, valid JSON object. The JSON object must have the following structure:
    {
      "overallVerdict": "A classification: 'Safe', 'Suspicious', 'Malicious', or 'Unknown'.",
      "analysisSummary": "A concise, one or two-sentence summary of your findings and a clear recommendation (e.g., 'This URL appears safe to visit.' or 'Do not visit this URL. It is likely a phishing site.').",
      "redFlags": [
        "An array of strings, where each string is a specific red flag you identified (e.g., 'Domain was registered very recently.', 'URL uses a suspicious TLD (.xyz).', 'The URL path contains misleading keywords to impersonate a known service.')."
      ],
      "certificateAnalysis": {
        "issuer": "The name of the Certificate Authority.",
        "subject": "The domain the certificate is issued to.",
        "validFrom": "The certificate's start date (YYYY-MM-DD).",
        "validTo": "The certificate's expiry date (YYYY-MM-DD).",
        "protocol": "The SSL/TLS protocol detected.",
        "summary": "A concise, one-sentence summary of the certificate's status and trustworthiness."
      }
    }

    Ensure the final output is ONLY the JSON object, without any markdown formatting or extraneous text. If no red flags are found, provide an empty array. If certificate information cannot be retrieved (e.g., for an HTTP site), this field can be omitted.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{googleSearch: {}}],
    },
  });

  const textResponse = response.text;

  try {
    const cleanedText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedResult = JSON.parse(cleanedText);

    const validVerdicts: URLVerdict[] = ['Safe', 'Suspicious', 'Malicious', 'Unknown'];
    if (!validVerdicts.includes(parsedResult.overallVerdict)) {
        parsedResult.overallVerdict = 'Unknown';
    }
    
    parsedResult.redFlags = parsedResult.redFlags || [];
    
    return parsedResult;
  } catch (error) {
    console.error("Failed to parse Gemini API JSON response for URL analysis:", error, "Raw response:", textResponse);
    return {
      overallVerdict: 'Unknown',
      analysisSummary: `An error occurred while parsing the analysis. The AI model may have provided a response in an unexpected format. Raw output: ${textResponse}`,
      redFlags: [],
    };
  }
}

export async function analyzeAuthToken(token: string): Promise<TokenAnalysisResult> {
    const prompt = `
      You are a cybersecurity expert specializing in authentication and authorization security, with deep knowledge of JSON Web Tokens (JWT) and other token formats. Your task is to analyze the provided auth token for security vulnerabilities and misconfigurations.

      The token is: "${token}"

      Your analysis process MUST follow these steps:
      1.  **Input Validation (Critical First Step):** First, check if the provided input is a URL (e.g., starts with http:// or https://).
          - If it IS a URL, you MUST stop immediately. Set the 'overallVerdict' to 'Invalid / Malformed'. Your 'analysisSummary' MUST state that the input is a URL and the user should use the 'URL Analyzer' tool instead for a proper analysis. Do not attempt any further token decoding or analysis.
          - If it is NOT a URL, proceed to the next steps.
      2.  **Token Decoding:** Assuming the input is not a URL, it is likely a JWT (three base64-encoded parts separated by dots). Attempt to decode the header (part 1) and the payload (part 2). If decoding fails, the token is malformed.
      3.  **Header Analysis:**
          - **Algorithm Check (Critical):** Check the 'alg' claim. The value 'none' is a critical vulnerability. Weak algorithms like HS256 (if used for public clients) are also a concern. Strong algorithms are RS256, ES256, etc.
      4.  **Payload Analysis & Security Check:**
          - **Expiration ('exp'):** Check for an 'exp' claim. A missing expiration claim is a major security risk. If present, check if the token has expired based on the current Unix timestamp.
          - **Standard Claims:** Look for 'iss' (issuer), 'aud' (audience), and 'sub' (subject) claims. Their absence or overly generic values can be a weakness.
          - **PII (Personally Identifiable Information) Exposure (Critical):** Scan the decoded payload for sensitive user data that should not be in a token, such as full names, email addresses, physical addresses, or roles with excessive permissions. This is a significant security risk.
          - **Token Lifetime:** If 'iat' (issued at) and 'exp' are present, assess if the token's lifetime is excessively long, which increases the risk of replay attacks if stolen.
      5.  **Verdict Formulation:** Based on all findings, formulate a verdict. An 'alg' of 'none', an expired timestamp, or severe PII exposure should lead to a harsh verdict.

      Provide your analysis as a single, valid JSON object. The JSON object must have the following structure:
      {
        "overallVerdict": "A classification: 'Valid & Safe', 'Valid & Potentially Risky', 'Invalid / Malformed', or 'Expired'.",
        "analysisSummary": "A concise, one or two-sentence summary of the token's security posture.",
        "securityRisks": [
          "An array of strings, where each string is a specific security risk identified (e.g., 'Token uses an insecure algorithm (none).', 'Token has expired.', 'Payload exposes sensitive PII (email address).', 'Token lifetime is excessively long.')."
        ],
        "decodedHeader": [
            { "key": "alg", "value": "RS256" },
            { "key": "typ", "value": "JWT" }
        ],
        "decodedPayload": [
            { "key": "sub", "value": "1234567890" },
            { "key": "name", "value": "John Doe" },
            { "key": "iat", "value": 1516239022 }
        ]
      }

      Ensure the final output is ONLY the JSON object, without any markdown formatting or extraneous text. If the token cannot be decoded, set the verdict to 'Invalid / Malformed' and explain in the summary. If no risks are found, provide an empty array for 'securityRisks'.
    `;
  
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
  
    const textResponse = response.text;
  
    try {
      const cleanedText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedResult = JSON.parse(cleanedText);
  
      const validVerdicts: TokenVerdict[] = ['Valid & Safe', 'Valid & Potentially Risky', 'Invalid / Malformed', 'Expired'];
      if (!validVerdicts.includes(parsedResult.overallVerdict)) {
          parsedResult.overallVerdict = 'Invalid / Malformed';
      }
      
      parsedResult.securityRisks = parsedResult.securityRisks || [];
      parsedResult.decodedHeader = parsedResult.decodedHeader || [];
      parsedResult.decodedPayload = parsedResult.decodedPayload || [];
      
      return parsedResult;
    } catch (error) {
      console.error("Failed to parse Gemini API JSON response for token analysis:", error, "Raw response:", textResponse);
      return {
        overallVerdict: 'Invalid / Malformed',
        analysisSummary: `An error occurred while parsing the analysis. The AI model may have provided a response in an unexpected format or the token is severely malformed. Raw output: ${textResponse}`,
        securityRisks: [],
        decodedHeader: [],
        decodedPayload: [],
      };
    }
}


export async function analyzeSecrets(text: string): Promise<SecretAnalysisResult> {
    const prompt = `
      You are an expert secrets detection engine. Your task is to scan the provided text for any exposed credentials, API keys, or other sensitive information. You must be extremely accurate and thorough.

      The text to analyze is:
      """
      ${text}
      """

      Your analysis process MUST follow these steps:
      1.  **Pattern Recognition:** Scan the text line by line for common secret patterns, including but not limited to:
          - API Keys (e.g., Google, AWS, Stripe, GitHub tokens)
          - Private Keys (e.g., RSA, PGP, SSH keys in PEM format)
          - Passwords in configuration or code.
          - Database connection strings with credentials.
          - OAuth client secrets.
          - High-entropy strings that look like keys.
      2.  **Classification & Risk Assessment:** For each potential secret found, classify its type (e.g., "AWS Access Key", "RSA Private Key") and assign a risk level ('Critical', 'High', 'Medium', 'Low').
      3.  **Contextual Analysis:** Provide the line number and a small snippet of the line where the secret was found.
      4.  **Remediation Advice:** For each finding, provide a clear, actionable suggestion for remediation (e.g., "Revoke this key immediately and store it in a secure secret manager.").
      5.  **Summarization:** Provide a final verdict and a concise summary of your findings.

      Provide your analysis as a single, valid JSON object. The JSON object must have the following structure:
      {
        "overallVerdict": "A classification: 'No Secrets Found', 'Secrets Found', or 'Analysis Incomplete'.",
        "analysisSummary": "A concise, one or two-sentence summary of your findings and the overall security posture of the text.",
        "foundSecrets": [
          {
            "line": 12,
            "type": "AWS Access Key ID",
            "snippet": "aws_access_key_id = AKIAIOSFODNN7EXAMPLE",
            "risk": "Critical",
            "suggestion": "This AWS key should be revoked immediately from the IAM console. Store credentials in a secrets management service like AWS Secrets Manager, not in plaintext."
          }
        ]
      }

      Ensure the final output is ONLY the JSON object, without any markdown formatting or extraneous text. If no secrets are found, the 'foundSecrets' array must be empty and the verdict should be 'No Secrets Found'.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    const textResponse = response.text;

    try {
        const cleanedText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedResult = JSON.parse(cleanedText);

        const validVerdicts: SecretVerdict[] = ['No Secrets Found', 'Secrets Found', 'Analysis Incomplete'];
        if (!validVerdicts.includes(parsedResult.overallVerdict)) {
            parsedResult.overallVerdict = 'Analysis Incomplete';
        }
        
        parsedResult.foundSecrets = parsedResult.foundSecrets || [];
        
        return parsedResult;
    } catch (error) {
        console.error("Failed to parse Gemini API JSON response for secret analysis:", error, "Raw response:", textResponse);
        return {
            overallVerdict: 'Analysis Incomplete',
            analysisSummary: `An error occurred while parsing the analysis. The AI model may have provided a response in an unexpected format. Raw output: ${textResponse}`,
            foundSecrets: [],
        };
    }
}


export async function analyzeRawEmail(source: string): Promise<RawEmailAnalysisResult> {
    const prompt = `
      You are an expert cybersecurity analyst specializing in email forensics. Your task is to perform a deep analysis of the provided raw email source (.eml format) to identify phishing, malware, and spam indicators.

      Your analysis process MUST follow these steps:
      1.  **Header Analysis (CRITICAL):**
          - Parse all major headers: 'From', 'To', 'Subject', 'Date', 'Return-Path', and all 'Received' headers.
          - **Authentication Check:** Scrutinize 'Authentication-Results' or similar headers to determine the results of SPF, DKIM, and DMARC. A failure in any of these is a major red flag for spoofing.
          - **Path Analysis:** Trace the email's path through the 'Received' headers to identify any unusual or suspicious relays.
      2.  **Body and Link Analysis:**
          - Extract all hyperlinks from the email body (both HTML '<a>' tags and plain text URLs).
          - For each URL, analyze it for phishing indicators: URL shorteners, mismatched anchor text vs. actual href, suspicious TLDs, and attempts to impersonate legitimate domains.
      3.  **Attachment Analysis:**
          - Identify any attachments declared in the MIME parts.
          - Analyze the filename and extension for high-risk types (e.g., .exe, .zip, .js, .scr, double extensions like .pdf.exe). You do not have the file content, so base the risk on metadata.
      4.  **Content Analysis:** Scan the email's text for social engineering tactics: urgency, threats, grammar mistakes, unusual requests.
      5.  **Verdict Formulation:** Synthesize all findings into a final verdict and a list of specific red flags.

      Provide your analysis as a single, valid JSON object. The JSON object must have the following structure:
      {
        "overallVerdict": "A classification: 'Safe', 'Suspicious', 'Malicious', 'Spam', or 'Unknown'.",
        "analysisSummary": "A concise, one or two-sentence summary of your findings and a clear recommendation.",
        "redFlags": [
          "An array of strings, where each string is a specific red flag identified (e.g., 'DMARC authentication failed, indicating potential spoofing.', 'URL anchor text 'google.com' points to a malicious domain.', 'Attachment has a high-risk executable file extension (.exe).')."
        ],
        "headerAnalysis": {
          "from": "The full 'From' address (e.g., 'Sender Name <sender@example.com>').",
          "subject": "The email's subject line.",
          "dkim": "The result of the DKIM check (e.g., 'pass', 'fail', 'none').",
          "spf": "The result of the SPF check (e.g., 'pass', 'fail', 'softfail', 'none').",
          "dmarc": "The result of the DMARC check (e.g., 'pass', 'fail', 'none').",
          "summary": "A brief summary of the header analysis, highlighting any signs of spoofing or anomalies."
        },
        "links": [
          {
            "url": "https://suspicious-link.com/login",
            "verdict": "'Safe' or 'Suspicious'.",
            "summary": "Reasoning for the link's verdict (e.g., 'Domain impersonates a known brand.')."
          }
        ],
        "attachments": [
          {
            "filename": "invoice.pdf.exe",
            "risk": "'High', 'Medium', 'Low', or 'None'.",
            "summary": "Reasoning for the risk assessment (e.g., 'Executable file disguised as a PDF. Potential malware.')."
          }
        ]
      }

      Ensure the final output is ONLY the JSON object, without any markdown formatting or extraneous text. If no links or attachments are found, provide empty arrays for those fields.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    const textResponse = response.text;

    try {
        const cleanedText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedResult = JSON.parse(cleanedText);

        const validVerdicts: RawEmailVerdict[] = ['Safe', 'Suspicious', 'Malicious', 'Spam', 'Unknown'];
        if (!validVerdicts.includes(parsedResult.overallVerdict)) {
            parsedResult.overallVerdict = 'Unknown';
        }
        
        parsedResult.redFlags = parsedResult.redFlags || [];
        parsedResult.links = parsedResult.links || [];
        parsedResult.attachments = parsedResult.attachments || [];
        
        return parsedResult;
    } catch (error) {
        console.error("Failed to parse Gemini API JSON response for raw email analysis:", error, "Raw response:", textResponse);
        return {
            overallVerdict: 'Unknown',
            analysisSummary: `An error occurred while parsing the analysis. The AI model may have provided a response in an unexpected format. Raw output: ${textResponse}`,
            redFlags: [],
            headerAnalysis: { from: 'N/A', subject: 'N/A', dkim: 'N/A', spf: 'N/A', dmarc: 'N/A', summary: 'Failed to parse headers.'},
            links: [],
            attachments: [],
        };
    }
}
