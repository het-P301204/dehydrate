'use client';

import React from 'react';

type BadgeVariant = 'critical' | 'high' | 'medium' | 'low' | 'info' | 'success' | 'default' | 'outline';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  critical: 'bg-serial-crimson/15 text-serial-crimson border border-serial-crimson/30 animate-pulse',
  high: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
  medium: 'bg-serial-amber/15 text-serial-amber border border-serial-amber/30',
  low: 'bg-serial-cyan/15 text-serial-cyan border border-serial-cyan/30',
  info: 'bg-serial-text-muted/20 text-serial-text-secondary border border-serial-border',
  success: 'bg-serial-emerald/15 text-serial-emerald border border-serial-emerald/30',
  default: 'bg-serial-surface3 text-serial-text-secondary border border-serial-border',
  outline: 'bg-transparent text-serial-text-secondary border border-serial-border-light',
};

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-medium tracking-wide ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, BadgeVariant> = {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
    INFO: 'info',
  };
  return <Badge variant={map[severity] ?? 'default'}>{severity}</Badge>;
}
