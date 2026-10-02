'use client';

import React from 'react';

interface SerialLogoProps {
  size?: number;
  monochrome?: boolean;
  showText?: boolean;
  className?: string;
}

export function SerialLogo({ size = 32, monochrome = false, showText = true, className = '' }: SerialLogoProps) {
  const accent = monochrome ? '#F8F8F8' : '#8B5CF6';
  const dim = monochrome ? '#A1A1AA' : '#06B6D4';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Chain node 1 */}
        <circle cx="6" cy="8" r="4" fill="none" stroke={accent} strokeWidth="1.5" />
        {/* Chain node 2 */}
        <circle cx="16" cy="16" r="4" fill="none" stroke={dim} strokeWidth="1.5" />
        {/* Chain node 3 */}
        <circle cx="26" cy="24" r="4" fill="none" stroke={accent} strokeWidth="1.5" />
        {/* Link 1→2 */}
        <line x1="10" y1="10" x2="12" y2="12" stroke={accent} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        {/* Link 2→3 */}
        <line x1="20" y1="18" x2="22" y2="20" stroke={dim} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        {/* Inner dots */}
        <circle cx="6" cy="8" r="1.5" fill={accent} />
        <circle cx="16" cy="16" r="1.5" fill={dim} />
        <circle cx="26" cy="24" r="1.5" fill={accent} />
        {/* S-curve path suggestion */}
        <path
          d="M 6 12 Q 11 14 16 12 Q 21 10 26 16"
          fill="none"
          stroke={accent}
          strokeWidth="0.75"
          strokeDasharray="2 3"
          opacity="0.35"
        />
      </svg>
      {showText && (
        <span
          className="font-mono font-bold tracking-[0.2em] text-serial-text"
          style={{ fontSize: size * 0.5, letterSpacing: '0.18em' }}
        >
          DEHYDRATE
        </span>
      )}
    </div>
  );
}

export const DehydrateLogo = SerialLogo;
export const InvokeLogo = SerialLogo;
