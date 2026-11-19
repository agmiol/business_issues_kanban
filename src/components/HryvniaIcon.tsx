import React from 'react';

interface HryvniaIconProps {
  className?: string;
}

export const HryvniaIcon: React.FC<HryvniaIconProps> = ({ className = 'w-3.5 h-3.5' }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Official Ukrainian Hryvnia symbol (₴) path */}
      <path d="M7 4.5C7 3 9.5 2 12 2C15 2 17 3.5 17 5.5C17 8 13.5 9.5 12 10C14 10.5 17 12 17 14.5C17 17 14.5 18 12 18C9.5 18 7 17 7 15" />
      <path d="M4 9.5H20" />
      <path d="M4 13.5H20" />
    </svg>
  );
};
