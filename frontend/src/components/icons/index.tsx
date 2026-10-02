'use client';

import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export function SerializationIcon({ size = 20, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="2" y="4" width="6" height="4" rx="1" stroke={color} strokeWidth="1.25" />
      <rect x="12" y="12" width="6" height="4" rx="1" stroke={color} strokeWidth="1.25" />
      <path d="M8 6H11M11 6V14M11 14H12" stroke={color} strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function ObjectGraphIcon({ size = 20, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="10" cy="10" r="3" stroke={color} strokeWidth="1.25" />
      <circle cx="3" cy="4" r="2" stroke={color} strokeWidth="1.25" />
      <circle cx="17" cy="4" r="2" stroke={color} strokeWidth="1.25" />
      <circle cx="3" cy="16" r="2" stroke={color} strokeWidth="1.25" />
      <circle cx="17" cy="16" r="2" stroke={color} strokeWidth="1.25" />
      <line x1="5" y1="5" x2="8" y2="8" stroke={color} strokeWidth="1" opacity="0.6" />
      <line x1="15" y1="5" x2="12" y2="8" stroke={color} strokeWidth="1" opacity="0.6" />
      <line x1="5" y1="15" x2="8" y2="12" stroke={color} strokeWidth="1" opacity="0.6" />
      <line x1="15" y1="15" x2="12" y2="12" stroke={color} strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

export function GadgetChainIcon({ size = 20, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="4" cy="10" r="2.5" stroke={color} strokeWidth="1.25" />
      <circle cx="10" cy="10" r="2.5" stroke={color} strokeWidth="1.25" />
      <circle cx="16" cy="10" r="2.5" stroke={color} strokeWidth="1.25" />
      <line x1="6.5" y1="10" x2="7.5" y2="10" stroke={color} strokeWidth="1.25" strokeLinecap="round" />
      <line x1="12.5" y1="10" x2="13.5" y2="10" stroke={color} strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function PayloadIcon({ size = 20, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="3" y="3" width="14" height="14" rx="2" stroke={color} strokeWidth="1.25" />
      <path d="M7 7h6M7 10h4M7 13h5" stroke={color} strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function ScannerIcon({ size = 20, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M3 10H17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <rect x="2" y="5" width="16" height="10" rx="2" stroke={color} strokeWidth="1.25" />
      <path d="M7 10V7M10 10V6M13 10V8" stroke={color} strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function ModelIcon({ size = 20, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="5" cy="5" r="2" stroke={color} strokeWidth="1.25" />
      <circle cx="15" cy="5" r="2" stroke={color} strokeWidth="1.25" />
      <circle cx="5" cy="15" r="2" stroke={color} strokeWidth="1.25" />
      <circle cx="15" cy="15" r="2" stroke={color} strokeWidth="1.25" />
      <circle cx="10" cy="10" r="2" stroke={color} strokeWidth="1.25" />
      <line x1="7" y1="5" x2="8.5" y2="9" stroke={color} strokeWidth="1" opacity="0.7" />
      <line x1="13" y1="5" x2="11.5" y2="9" stroke={color} strokeWidth="1" opacity="0.7" />
      <line x1="7" y1="15" x2="8.5" y2="11" stroke={color} strokeWidth="1" opacity="0.7" />
      <line x1="13" y1="15" x2="11.5" y2="11" stroke={color} strokeWidth="1" opacity="0.7" />
    </svg>
  );
}

export function CallbackIcon({ size = 20, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="10" cy="10" r="7" stroke={color} strokeWidth="1.25" strokeDasharray="3 2" />
      <circle cx="10" cy="10" r="3" stroke={color} strokeWidth="1.25" />
      <path d="M10 3V1M17 10h2M10 17v2M3 10H1" stroke={color} strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function RuntimeIcon({ size = 20, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="2" y="3" width="16" height="12" rx="2" stroke={color} strokeWidth="1.25" />
      <path d="M6 9l2.5 2-2.5 2M10 13h4" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="5" y1="17" x2="15" y2="17" stroke={color} strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function LabIcon({ size = 20, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M8 3v7l-3 5h10l-3-5V3" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="7" y1="3" x2="13" y2="3" stroke={color} strokeWidth="1.25" strokeLinecap="round" />
      <circle cx="9" cy="13" r="0.75" fill={color} />
      <circle cx="12" cy="14" r="0.75" fill={color} />
    </svg>
  );
}
