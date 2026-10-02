'use client';

import React from 'react';
import type { TimelineEvent } from '@/lib/mock/events';

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const typeColors: Record<string, { dot: string; line: string; text: string }> = {
  info: { dot: 'bg-serial-cyan', line: 'border-serial-cyan/30', text: 'text-serial-cyan' },
  warn: { dot: 'bg-serial-amber', line: 'border-serial-amber/30', text: 'text-serial-amber' },
  success: { dot: 'bg-serial-emerald', line: 'border-serial-emerald/30', text: 'text-serial-emerald' },
  error: { dot: 'bg-serial-crimson', line: 'border-serial-crimson/30', text: 'text-serial-crimson' },
};

export function Timeline({ events, className = '' }: TimelineProps) {
  return (
    <div className={`space-y-0 ${className}`}>
      {events.map((event, i) => {
        const colors = typeColors[event.type] ?? typeColors.info;
        return (
          <div key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${colors.dot}`} />
              {i < events.length - 1 && (
                <div className={`w-px flex-1 mt-1 border-l border-dashed ${colors.line} opacity-40`} style={{ minHeight: '24px' }} />
              )}
            </div>
            <div className="pb-4 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-mono text-serial-text-muted">{event.timestamp}</span>
                {event.source && (
                  <span className="text-[10px] font-mono text-serial-text-muted/60">[{event.source}]</span>
                )}
              </div>
              <p className={`text-xs ${colors.text} break-words`}>{event.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
