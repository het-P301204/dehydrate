'use client';

import { useState, useMemo } from 'react';
import { findings } from '@/lib/mock/findings';
import type { Finding, FindingSeverity, FindingStatus } from '@/lib/mock/findings';
import { Badge, SeverityBadge } from '@/components/ui/Badge';

const SEVERITIES: Array<'All' | FindingSeverity> = ['All', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];
const STATUSES: Array<'All' | FindingStatus> = ['All', 'Open', 'In Review', 'Remediated', 'Closed'];

function statusColor(s: FindingStatus) {
  if (s === 'Open') return 'text-serial-amber';
  if (s === 'In Review') return 'text-serial-cyan';
  if (s === 'Remediated') return 'text-serial-emerald';
  return 'text-serial-text-muted';
}

function severityCount(sev: FindingSeverity) {
  return findings.filter(f => f.severity === sev).length;
}

export default function FindingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'All' | FindingSeverity>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | FindingStatus>('All');
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  const filtered = useMemo(() => {
    return findings.filter(f => {
      if (filterSeverity !== 'All' && f.severity !== filterSeverity) return false;
      if (filterStatus !== 'All' && f.status !== filterStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return f.title.toLowerCase().includes(q) || f.id.toLowerCase().includes(q) || f.format.toLowerCase().includes(q);
      }
      return true;
    });
  }, [filterSeverity, filterStatus, searchQuery]);

  const filterBtnClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
      active
        ? 'bg-serial-violet text-white border border-serial-violet/50'
        : 'bg-serial-surface2 text-serial-text-secondary border border-serial-border hover:border-serial-border-light hover:text-serial-text'
    }`;

  return (
    <div className="flex h-full relative">
      {/* Main content */}
      <div className={`flex-1 p-6 space-y-6 min-w-0 transition-all duration-300 ${selectedFinding ? 'mr-96' : ''}`}>
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-serial-text tracking-tight">Findings</h1>
          <p className="text-sm text-serial-text-muted mt-1">
            7 research findings across Python, Java, and .NET
          </p>
        </div>

        {/* Severity stats */}
        <div className="flex items-center gap-4 text-xs font-mono flex-wrap">
          <span className="text-serial-crimson font-bold">{severityCount('CRITICAL')} Critical</span>
          <span>·</span>
          <span className="text-orange-400 font-bold">{severityCount('HIGH')} High</span>
          <span>·</span>
          <span className="text-serial-amber font-bold">{severityCount('MEDIUM')} Medium</span>
          <span>·</span>
          <span className="text-serial-cyan font-bold">{severityCount('LOW')} Low</span>
          <span>·</span>
          <span className="text-serial-text-muted font-bold">{severityCount('INFO')} Info</span>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-serial-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search findings..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-serial-surface2 border border-serial-border rounded-xl text-sm text-serial-text placeholder:text-serial-text-muted focus:outline-none focus:border-serial-border-light"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-serial-text-muted font-mono w-16 shrink-0">SEVERITY</span>
            {SEVERITIES.map(s => (
              <button key={s} onClick={() => setFilterSeverity(s)} className={filterBtnClass(filterSeverity === s)}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-serial-text-muted font-mono w-16 shrink-0">STATUS</span>
            {STATUSES.map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} className={filterBtnClass(filterStatus === s)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-serial-surface border border-serial-border rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-serial-border bg-serial-surface2">
                <th className="text-left px-4 py-3 text-[10px] font-mono text-serial-text-muted tracking-wider">ID</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono text-serial-text-muted tracking-wider">TITLE</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono text-serial-text-muted tracking-wider">SEVERITY</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono text-serial-text-muted tracking-wider">FORMAT</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono text-serial-text-muted tracking-wider">RUNTIME</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono text-serial-text-muted tracking-wider">STATUS</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono text-serial-text-muted tracking-wider">DATE</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-serial-text-muted text-sm">
                    No findings match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((finding, i) => (
                  <tr
                    key={finding.id}
                    onClick={() => setSelectedFinding(selectedFinding?.id === finding.id ? null : finding)}
                    className={`border-b border-serial-border last:border-b-0 cursor-pointer transition-colors duration-100 ${
                      selectedFinding?.id === finding.id
                        ? 'bg-serial-surface3'
                        : i % 2 === 0 ? 'hover:bg-serial-surface2' : 'bg-serial-bg/30 hover:bg-serial-surface2'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-serial-text-muted">{finding.id}</span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <span className="text-sm text-serial-text truncate block">{finding.title}</span>
                    </td>
                    <td className="px-4 py-3">
                      <SeverityBadge severity={finding.severity} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="default">{finding.format}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-serial-text-muted font-mono">{finding.runtime}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-mono font-medium ${statusColor(finding.status)}`}>{finding.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-serial-text-muted font-mono">{finding.discoveredAt.split(' ')[0]}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 bg-serial-surface border-l border-serial-border overflow-y-auto transition-all duration-300 z-20 ${
          selectedFinding ? 'w-96' : 'w-0 overflow-hidden'
        }`}
        style={{ top: '57px' }}
      >
        {selectedFinding && (
          <div className="p-5 space-y-5">
            {/* Panel header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-serial-text-muted">{selectedFinding.id}</span>
                  <SeverityBadge severity={selectedFinding.severity} />
                  <span className={`text-xs font-mono ${statusColor(selectedFinding.status)}`}>{selectedFinding.status}</span>
                </div>
                <h3 className="text-sm font-semibold text-serial-text leading-tight">{selectedFinding.title}</h3>
              </div>
              <button
                onClick={() => setSelectedFinding(null)}
                className="shrink-0 ml-2 p-1.5 rounded-lg hover:bg-serial-surface2 text-serial-text-muted hover:text-serial-text transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-serial-surface2 rounded-lg p-2.5">
                <p className="text-[10px] font-mono text-serial-text-muted">FORMAT</p>
                <p className="text-xs text-serial-text mt-0.5 font-mono">{selectedFinding.format}</p>
              </div>
              <div className="bg-serial-surface2 rounded-lg p-2.5">
                <p className="text-[10px] font-mono text-serial-text-muted">RUNTIME</p>
                <p className="text-xs text-serial-text mt-0.5 font-mono">{selectedFinding.runtime}</p>
              </div>
              <div className="bg-serial-surface2 rounded-lg p-2.5 col-span-2">
                <p className="text-[10px] font-mono text-serial-text-muted">DISCOVERED</p>
                <p className="text-xs text-serial-text mt-0.5 font-mono">{selectedFinding.discoveredAt}</p>
              </div>
            </div>

            {/* Evidence */}
            <div>
              <p className="text-[10px] font-mono text-serial-text-muted tracking-wider mb-2">EVIDENCE</p>
              <pre className="bg-black/60 border border-serial-border rounded-lg p-3 text-xs font-mono text-serial-text-secondary whitespace-pre-wrap leading-relaxed">
                {selectedFinding.evidence}
              </pre>
            </div>

            {/* Impact */}
            <div>
              <p className="text-[10px] font-mono text-serial-text-muted tracking-wider mb-2">IMPACT</p>
              <p className="text-xs text-serial-text-secondary leading-relaxed">{selectedFinding.impact}</p>
            </div>

            {/* Remediation */}
            <div>
              <p className="text-[10px] font-mono text-serial-text-muted tracking-wider mb-2">REMEDIATION</p>
              <div className="space-y-1.5">
                {selectedFinding.remediation.split('. ').filter(Boolean).map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="shrink-0 w-4 h-4 rounded bg-serial-violet/10 border border-serial-violet/30 text-serial-violet text-[10px] font-mono flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-xs text-serial-text-secondary leading-relaxed">{step.trim()}{step.endsWith('.') ? '' : '.'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* References */}
            <div>
              <p className="text-[10px] font-mono text-serial-text-muted tracking-wider mb-2">REFERENCES</p>
              <div className="space-y-1">
                {selectedFinding.references.map((ref, i) => (
                  <p key={i} className="text-xs font-mono text-serial-cyan bg-black/40 border border-serial-border rounded px-2 py-1 leading-relaxed break-all">
                    {ref}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
