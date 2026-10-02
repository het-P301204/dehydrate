'use client';

import React from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  label?: string;
  showValue?: boolean;
  className?: string;
  height?: string;
}

export function ProgressBar({
  value,
  color = 'bg-serial-violet',
  label,
  showValue = true,
  className = '',
  height = 'h-1.5',
}: ProgressBarProps) {
  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-serial-text-secondary">{label}</span>}
          {showValue && (
            <span className="text-xs font-mono text-serial-text-muted">{value}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-serial-surface3 rounded-full ${height}`}>
        <div
          className={`${color} ${height} rounded-full transition-all duration-700`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
