'use client';

import React from 'react';

export type LogLevel = 'info' | 'warn' | 'success' | 'error';

interface LogEntry {
  timestamp: string;
  type: LogLevel;
  message: string;
  source?: string;
}

interface TerminalProps {
  entries: LogEntry[];
  title?: string;
  className?: string;
  maxHeight?: string;
}

const levelColors: Record<LogLevel, string> = {
  info: 'text-serial-cyan',
  warn: 'text-serial-amber',
  success: 'text-serial-emerald',
  error: 'text-serial-crimson',
};

const levelPrefixes: Record<LogLevel, string> = {
  info: '●',
  warn: '▲',
  success: '✓',
  error: '✕',
};

export function Terminal({ entries, title = 'TERMINAL', className = '', maxHeight = '320px' }: TerminalProps) {
  return (
    <div className={`bg-black/60 border border-serial-border rounded-xl overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-serial-border bg-serial-surface/50">
        <span className="w-2.5 h-2.5 rounded-full bg-serial-crimson/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-serial-amber/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-serial-emerald/70" />
        <span className="text-xs font-mono text-serial-text-muted ml-2 tracking-widest">{title}</span>
      </div>
      <div
        className="p-4 overflow-y-auto font-mono text-xs space-y-1"
        style={{ maxHeight }}
      >
        {entries.map((entry, i) => (
          <div key={i} className="flex gap-3 items-start">
            <span className="text-serial-text-muted shrink-0">[{entry.timestamp}]</span>
            <span className={`shrink-0 ${levelColors[entry.type]}`}>{levelPrefixes[entry.type]}</span>
            {entry.source && (
              <span className="text-serial-violet shrink-0">{entry.source}:</span>
            )}
            <span className="text-serial-text-secondary break-all">{entry.message}</span>
          </div>
        ))}
        {entries.length === 0 && (
          <span className="text-serial-text-muted">Waiting for events...</span>
        )}
        {/* Blinking cursor at end of last line */}
        <span className="inline-block w-1.5 h-3 bg-serial-violet/70 align-middle" style={{ animation: 'blink 1.1s step-end infinite' }} />
        <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
      </div>
    </div>
  );
}
