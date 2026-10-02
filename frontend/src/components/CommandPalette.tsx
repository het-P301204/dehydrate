'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Command, X, ArrowRight } from 'lucide-react';

interface Command_Item {
  id: string;
  label: string;
  description?: string;
  href?: string;
  action?: () => void;
  category: string;
}

const commands: Command_Item[] = [
  { id: 'dashboard', label: 'Dashboard', description: 'Go to main dashboard', href: '/dashboard', category: 'Navigation' },
  { id: 'research', label: 'Open Research Lab', description: 'Start a research session', href: '/dashboard/research', category: 'Research' },
  { id: 'payload', label: 'Payload Lab', description: 'Build serialized payloads', href: '/dashboard/payload', category: 'Research' },
  { id: 'gadgets', label: 'Gadget Chain Explorer', description: 'Explore gadget chains with React Flow', href: '/dashboard/gadgets', category: 'Research' },
  { id: 'inspector', label: 'Object Inspector', description: 'Inspect serialized objects', href: '/dashboard/inspector', category: 'Research' },
  { id: 'fingerprint', label: 'Runtime Fingerprint', description: 'Fingerprint deserialization environment', href: '/dashboard/fingerprint', category: 'Analysis' },
  { id: 'scanner', label: 'Scanner Lab', description: 'Test payloads against scanners', href: '/dashboard/scanner', category: 'Analysis' },
  { id: 'ml', label: 'ML Model Lab', description: 'Analyze ML model serialization', href: '/dashboard/ml-model', category: 'Analysis' },
  { id: 'callback', label: 'Callback Lab', description: 'OOB callback simulation', href: '/dashboard/callback', category: 'Analysis' },
  { id: 'labs', label: 'Labs', description: 'Browse all 25 labs', href: '/dashboard/labs', category: 'Learning' },
  { id: 'findings', label: 'Findings', description: 'View research findings', href: '/dashboard/findings', category: 'Reporting' },
  { id: 'reports', label: 'Generate Report', description: 'Create research reports', href: '/dashboard/reports', category: 'Reporting' },
  { id: 'docs', label: 'Documentation', description: 'Reference docs', href: '/dashboard/docs', category: 'Reference' },
  { id: 'settings', label: 'Settings', description: 'Configure the platform', href: '/dashboard/settings', category: 'Reference' },
];

interface CommandPaletteProps {
  onClose: () => void;
}

export function CommandPalette({ onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = commands.filter(
    (c) =>
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.description?.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (cmd: Command_Item) => {
    if (cmd.href) router.push(cmd.href);
    if (cmd.action) cmd.action();
    onClose();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && filtered[selected]) handleSelect(filtered[selected]);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-serial-surface border border-serial-border rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-serial-border">
          <Command size={16} className="text-serial-text-muted shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
            onKeyDown={handleKey}
            placeholder="Search commands..."
            className="flex-1 bg-transparent text-sm text-serial-text placeholder-serial-text-muted outline-none font-mono"
          />
          <button onClick={onClose} className="text-serial-text-muted hover:text-serial-text transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-serial-text-muted font-mono">No commands found</div>
          ) : (
            filtered.map((cmd, i) => (
              <button
                key={cmd.id}
                onClick={() => handleSelect(cmd)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${i === selected ? 'bg-serial-surface3' : 'hover:bg-serial-surface2'}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-serial-text font-medium">{cmd.label}</div>
                  {cmd.description && <div className="text-xs text-serial-text-muted truncate">{cmd.description}</div>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-serial-text-muted font-mono">{cmd.category}</span>
                  {i === selected && <ArrowRight size={12} className="text-serial-violet" />}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-serial-border flex items-center gap-4 text-[10px] font-mono text-serial-text-muted">
          <span><kbd className="bg-serial-surface3 px-1 rounded">↑↓</kbd> navigate</span>
          <span><kbd className="bg-serial-surface3 px-1 rounded">↵</kbd> select</span>
          <span><kbd className="bg-serial-surface3 px-1 rounded">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
