'use client';

import React, { useEffect, useState } from 'react';

interface MetricProps {
  value: number | string;
  label: string;
  suffix?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
  animate?: boolean;
}

export function Metric({ value, label, suffix = '', icon, className = '', animate = true }: MetricProps) {
  const isNumber = typeof value === 'number';
  const [displayed, setDisplayed] = useState(animate && isNumber ? 0 : value);

  useEffect(() => {
    if (!animate || !isNumber) return;
    const target = value as number;
    const duration = 1000;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, animate, isNumber]);

  return (
    <div className={`bg-serial-surface border border-serial-border rounded-2xl p-5 shadow-lg shadow-black/20 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-mono text-serial-text-muted tracking-widest uppercase">{label}</span>
        {icon && <span className="text-serial-text-muted">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-serial-text tabular-nums">{displayed}</span>
        {suffix && <span className="text-sm text-serial-text-secondary">{suffix}</span>}
      </div>
    </div>
  );
}
