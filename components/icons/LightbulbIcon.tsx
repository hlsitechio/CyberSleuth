import React from 'react';

export const LightbulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth="1.5" 
    stroke="currentColor" 
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-1.5c1.5-1.5 1.5-3.75 0-5.25S10.5 4.5 9 6s-1.5 3.75 0 5.25a6.01 6.01 0 0 0 1.5 1.5m0 0H12m0 0v-5.25m0 5.25c5.05-1.5 5.05-7.5 0-9s-5.05 7.5 0 9Z" />
  </svg>
);