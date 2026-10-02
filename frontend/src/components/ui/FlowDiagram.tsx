'use client';

import React from 'react';

interface FlowStep {
  label: string;
  active?: boolean;
  highlight?: boolean;
}

interface FlowDiagramProps {
  steps: FlowStep[];
  className?: string;
}

export function FlowDiagram({ steps, className = '' }: FlowDiagramProps) {
  return (
    <div className={`flex items-center gap-0 flex-wrap ${className}`}>
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <div
            className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-wide border transition-colors ${
              step.active
                ? 'bg-serial-violet/20 border-serial-violet text-serial-violet'
                : step.highlight
                ? 'bg-serial-cyan/10 border-serial-cyan/40 text-serial-cyan'
                : 'bg-serial-surface2 border-serial-border text-serial-text-secondary'
            }`}
          >
            {step.label}
          </div>
          {i < steps.length - 1 && (
            <div className="px-1 text-serial-text-muted text-xs">→</div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
