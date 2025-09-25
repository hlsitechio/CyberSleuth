import React, { useState, useCallback } from 'react';

// Note: MD5 is not available in Web Crypto API for security reasons.
// This is a simplified, common implementation for non-cryptographic purposes.
async function md5(message: string): Promise<string> {
    // A simple, non-secure hash function for demonstration if needed.
    // For real applications, prefer SHA series.
    // This is a placeholder; a proper MD5 library would be needed for browser.
    // However, given its insecurity, we will omit it from the main UI and focus on SHA.
    return "MD5 not supported in secure contexts.";
}

async function digest(algo: AlgorithmIdentifier, data: string): Promise<string> {
    const enc = new TextEncoder().encode(data);
    const buf = await crypto.subtle.digest(algo, enc);
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const HashTool: React.FC = () => {
    const [text, setText] = useState("");
    const [hashes, setHashes] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleHash = useCallback(async () => {
        if (!text) {
            setHashes({});
            return;
        }
        setIsLoading(true);
        try {
            const [sha1, sha256, sha512] = await Promise.all([
                digest("SHA-1", text),
                digest("SHA-256", text),
                digest("SHA-512", text),
            ]);
            setHashes({
                "SHA-1": sha1,
                "SHA-256": sha256,
                "SHA-512": sha512,
            });
        } catch (error) {
            console.error("Hashing failed:", error);
            setHashes({ Error: "Could not generate hashes." });
        }
        setIsLoading(false);
    }, [text]);
    
    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-xl p-6 space-y-6">
            <p className="text-center text-gray-400">Generate cryptographic hashes from text using the browser's Web Crypto API.</p>
            <div className="space-y-4">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type or paste content here to hash..."
                    className="w-full h-32 bg-gray-900/50 p-3 rounded-lg border border-gray-700 shadow-inner focus:ring-2 focus:ring-cyan-500 focus:outline-none font-mono text-sm"
                />
                <div className="flex justify-end">
                    <button onClick={handleHash} disabled={isLoading} className="bg-cyan-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-cyan-500 disabled:bg-gray-600">
                        {isLoading ? 'Generating...' : 'Generate Hashes'}
                    </button>
                </div>
            </div>
            
            {Object.keys(hashes).length > 0 && (
                <div className="space-y-3">
                    {Object.entries(hashes).map(([algo, hashValue]) => (
                        <div key={algo} className="bg-gray-900/50 p-3 rounded-md border border-gray-700">
                            <h4 className="text-sm font-semibold text-gray-400">{algo}</h4>
                            <p className="font-mono text-sm text-cyan-300 break-all mt-1">{hashValue}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};