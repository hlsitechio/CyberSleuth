import React from 'react';
import { ShieldIcon } from './icons/ShieldIcon';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <div className="flex items-center justify-center gap-4">
        <ShieldIcon className="h-12 w-12 text-cyan-400" />
        <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
          CyberSleuth
        </h1>
      </div>
      <p className="mt-4 text-xl text-gray-300">Cybersecurity Analysis Tool</p>
    </header>
  );
};
