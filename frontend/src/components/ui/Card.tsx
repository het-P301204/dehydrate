'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hoverable = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-serial-surface border border-serial-border rounded-2xl shadow-lg shadow-black/20 transition-colors duration-200 ${hoverable ? 'cursor-pointer hover:border-serial-violet/40 hover:bg-serial-surface2' : 'hover:border-serial-border-light'} ${className}`}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between p-5 border-b border-serial-border">
      <div>
        <h3 className="text-sm font-semibold text-serial-text tracking-wide">{title}</h3>
        {subtitle && <p className="text-xs text-serial-text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 ml-4">{action}</div>}
    </div>
  );
}

export function CardBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}
