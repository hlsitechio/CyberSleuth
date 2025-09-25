
import React from 'react';

export const ShieldIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={props.className}
  >
    <path
      fillRule="evenodd"
      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm.53 14.03a.75.75 0 00-1.06 0l-3-3a.75.75 0 10-1.06 1.06l3.5 3.5a.75.75 0 001.06 0l7.5-7.5a.75.75 0 10-1.06-1.06l-7 7z"
      clipRule="evenodd"
    />
  </svg>
);
