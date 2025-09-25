import React, { useState } from 'react';
import { Header } from './components/Header';
import { AddressAnalyzer } from './components/AddressAnalyzer';
import { ScreenshotAnalyzer } from './components/ScreenshotAnalyzer';
import { URLAnalyzer } from './components/URLAnalyzer';
import { AuthTokenAnalyzer } from './components/AuthTokenAnalyzer';
import { RawEmailAnalyzer } from './components/RawEmailAnalyzer';
import { SecretScanner } from './components/SecretScanner';
import { HashTool } from './components/HashTool';
import { Base64Tool } from './components/Base64Tool';

import { AtSymbolIcon } from './components/icons/AtSymbolIcon';
import { PhotoIcon } from './components/icons/PhotoIcon';
import { GlobeAltIcon } from './components/icons/GlobeAltIcon';
import { KeyRoundIcon } from './components/icons/KeyRoundIcon';
import { DocumentTextIcon } from './components/icons/DocumentTextIcon';
import { ExclamationTriangleIcon } from './components/icons/ExclamationTriangleIcon';
import { HashIcon } from './components/icons/HashIcon';
import { Code2Icon } from './components/icons/Code2Icon';
import { ShieldIcon } from './components/icons/ShieldIcon';

const tools = [
    { id: 'address', label: 'Address', icon: <AtSymbolIcon className="h-5 w-5" />, component: <AddressAnalyzer /> },
    { id: 'screenshot', label: 'Screenshot', icon: <PhotoIcon className="h-5 w-5" />, component: <ScreenshotAnalyzer /> },
    { id: 'url', label: 'URL', icon: <GlobeAltIcon className="h-5 w-5" />, component: <URLAnalyzer /> },
    { id: 'rawEmail', label: 'Email Source', icon: <DocumentTextIcon className="h-5 w-5" />, component: <RawEmailAnalyzer /> },
    { id: 'token', label: 'Token', icon: <KeyRoundIcon className="h-5 w-5" />, component: <AuthTokenAnalyzer /> },
    { id: 'secret', label: 'Secrets', icon: <ExclamationTriangleIcon className="h-5 w-5" />, component: <SecretScanner /> },
    { id: 'hash', label: 'Hash', icon: <HashIcon className="h-5 w-5" />, component: <HashTool /> },
    { id: 'base64', label: 'Base64', icon: <Code2Icon className="h-5 w-5" />, component: <Base64Tool /> },
];

const Hero = () => (
    <div className="text-center py-16">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">A professional single‑page toolkit for modern security teams</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">Audit URLs, analyze emails, detect secrets, and transform data with a suite of powerful, easy-to-use tools.</p>
    </div>
);

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
    <div className="flex items-start gap-3">
        <div className="mt-1 rounded-xl bg-cyan-500/10 p-2 text-cyan-400">{icon}</div>
        <div>
            <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
            <p className="text-sm text-gray-400">{desc}</p>
        </div>
    </div>
);

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState(tools[0].id);
    const activeTool = tools.find(t => t.id === activeTab);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
            <div className="container mx-auto px-4 py-8">
                <Header />
                <main className="mt-8">
                    <Hero />
                    <div className="max-w-4xl mx-auto">
                        <SectionTitle 
                            icon={<ShieldIcon className="h-6 w-6" />} 
                            title="Security Tools" 
                            desc="Select a tool to begin your analysis." 
                        />
                        <div className="mt-6">
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1 p-1 bg-gray-800/50 rounded-lg border border-gray-700" role="tablist">
                                {tools.map(tool => (
                                    <button
                                        key={tool.id}
                                        role="tab"
                                        aria-selected={activeTab === tool.id}
                                        onClick={() => setActiveTab(tool.id)}
                                        className={`flex flex-col sm:flex-row items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${
                                            activeTab === tool.id
                                                ? 'bg-cyan-600 text-white'
                                                : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                                        }`}
                                    >
                                        {tool.icon}
                                        <span>{tool.label}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="mt-6">
                                {activeTool && (
                                    <div key={activeTool.id} className="animate-fade-in" role="tabpanel">
                                        {activeTool.component}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
                <footer className="text-center text-gray-500 mt-16 pb-4">
                    <p>&copy; {new Date().getFullYear()} CyberSleuth. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
};

export default App;