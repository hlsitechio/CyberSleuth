import React, { useState } from 'react';

export const Base64Tool: React.FC = () => {
    const [text, setText] = useState("");
    const [output, setOutput] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleEncode = () => {
        setError(null);
        if (!text) {
            setOutput("");
            return;
        }
        try {
            setOutput(btoa(text));
        } catch (e) {
            setError("Encoding failed. The input may contain characters not supported by the btoa method.");
            setOutput("");
        }
    };

    const handleDecode = () => {
        setError(null);
        if (!text) {
            setOutput("");
            return;
        }
        try {
            setOutput(atob(text));
        } catch (e) {
            setError("Decoding failed. The input is not a valid Base64 string.");
            setOutput("");
        }
    };
    
    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-xl p-6 space-y-6">
            <p className="text-center text-gray-400">Encode text to Base64 or decode a Base64 string.</p>
            <div className="space-y-4">
                 <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type or paste content here..."
                    className="w-full h-32 bg-gray-900/50 p-3 rounded-lg border border-gray-700 shadow-inner focus:ring-2 focus:ring-cyan-500 focus:outline-none font-mono text-sm"
                />
                <div className="flex flex-wrap gap-4 justify-end">
                    <button onClick={handleEncode} className="bg-cyan-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-cyan-500">
                        Encode
                    </button>
                    <button onClick={handleDecode} className="bg-gray-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-gray-500">
                        Decode
                    </button>
                </div>
            </div>
            
            {(output || error) && (
                <div className="bg-gray-900/50 p-3 rounded-md border border-gray-700">
                     <h4 className="text-sm font-semibold text-gray-400">Output</h4>
                    {output && <p className="font-mono text-sm text-cyan-300 break-all mt-1">{output}</p>}
                    {error && <p className="font-mono text-sm text-red-400 break-all mt-1">{error}</p>}
                </div>
            )}
        </div>
    );
};