'use client';

import { useState } from 'react';
import { mockReport } from '@/lib/mock/reports';
import { Button } from '@/components/ui/Button';

type Template = 'executive' | 'technical' | 'summary';
type ExportFormat = 'markdown' | 'json' | 'html';

const TEMPLATE_OPTIONS: Array<{ id: Template; label: string; desc: string; icon: string }> = [
  { id: 'executive', label: 'Executive Report', desc: 'High-level summary for management', icon: '📊' },
  { id: 'technical', label: 'Technical Deep-Dive', desc: 'Full technical findings with evidence', icon: '🔬' },
  { id: 'summary', label: 'Findings Summary', desc: 'Tabular findings overview', icon: '📋' },
];

const ACTIVE_LABS = [
  { id: 1, label: 'Lab 01 — Python Pickle' },
  { id: 2, label: 'Lab 02 — Object Injection' },
  { id: 5, label: 'Lab 05 — ML Model Risks' },
  { id: 6, label: 'Lab 06 — Java Serialization' },
  { id: 7, label: 'Lab 07 — .NET ViewState' },
];

function getDateStr(offset: number) {
  const d = new Date('2026-10-02');
  d.setDate(d.getDate() - offset);
  return d.toISOString().split('T')[0];
}

export default function ReportsPage() {
  const [template, setTemplate] = useState<Template>('executive');
  const [dateFrom, setDateFrom] = useState(getDateStr(7));
  const [dateTo, setDateTo] = useState(getDateStr(0));
  const [selectedLabs, setSelectedLabs] = useState<number[]>([1, 2]);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('markdown');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleLab = (id: number) => {
    setSelectedLabs(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  const handleGenerate = () => {
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(mockReport.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const ext = exportFormat === 'json' ? 'json' : exportFormat === 'html' ? 'html' : 'md';
    const content = exportFormat === 'json'
      ? JSON.stringify(mockReport, null, 2)
      : exportFormat === 'html'
        ? `<!DOCTYPE html><html><body><pre>${mockReport.content}</pre></body></html>`
        : mockReport.content;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `serial-report-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatBtnClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
      active
        ? 'bg-serial-violet text-white border border-serial-violet/50'
        : 'bg-serial-surface2 text-serial-text-secondary border border-serial-border hover:border-serial-border-light'
    }`;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-serial-text tracking-tight">Reports</h1>
        <p className="text-sm text-serial-text-muted mt-1">Generate research reports from lab findings</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* LEFT — Generator */}
        <div className="col-span-1 space-y-5">
          <div className="bg-serial-surface border border-serial-border rounded-2xl p-5 space-y-5">
            <h2 className="text-xs font-mono text-serial-text-muted tracking-widest">REPORT GENERATOR</h2>

            {/* Template */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-serial-text-secondary">Template</p>
              {TEMPLATE_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setTemplate(opt.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    template === opt.id
                      ? 'border-serial-violet bg-serial-violet/5'
                      : 'border-serial-border bg-serial-surface2 hover:border-serial-border-light'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`flex-1 ${template === opt.id ? 'border-l-2 border-serial-violet pl-2' : ''}`}>
                      <p className="text-xs font-medium text-serial-text">{opt.label}</p>
                      <p className="text-[10px] text-serial-text-muted mt-0.5">{opt.desc}</p>
                    </div>
                    {template === opt.id && (
                      <span className="text-serial-violet shrink-0">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Date range */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-serial-text-secondary">Date Range</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-serial-text-muted font-mono">FROM</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    className="w-full mt-1 px-2 py-1.5 bg-serial-surface2 border border-serial-border rounded-lg text-xs text-serial-text font-mono focus:outline-none focus:border-serial-border-light"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-serial-text-muted font-mono">TO</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    className="w-full mt-1 px-2 py-1.5 bg-serial-surface2 border border-serial-border rounded-lg text-xs text-serial-text font-mono focus:outline-none focus:border-serial-border-light"
                  />
                </div>
              </div>
            </div>

            {/* Lab selector */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-serial-text-secondary">Include Labs</p>
              <div className="space-y-1.5">
                {ACTIVE_LABS.map(lab => (
                  <label key={lab.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedLabs.includes(lab.id)}
                      onChange={() => toggleLab(lab.id)}
                      className="w-3.5 h-3.5 accent-serial-violet rounded"
                    />
                    <span className="text-xs text-serial-text-secondary">{lab.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Export format */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-serial-text-secondary">Export Format</p>
              <div className="flex gap-2">
                {(['markdown', 'json', 'html'] as ExportFormat[]).map(fmt => (
                  <button key={fmt} onClick={() => setExportFormat(fmt)} className={formatBtnClass(exportFormat === fmt)}>
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate */}
            <Button
              onClick={handleGenerate}
              loading={generating}
              disabled={generating}
              className="w-full"
              size="md"
            >
              {generating ? 'GENERATING...' : 'GENERATE REPORT'}
            </Button>
          </div>
        </div>

        {/* RIGHT — Preview */}
        <div className="col-span-2">
          <div className="bg-serial-surface border border-serial-border rounded-2xl overflow-hidden h-full flex flex-col">
            {/* Preview header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-serial-border bg-serial-surface2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-serial-text-muted tracking-widest">PREVIEW</span>
                {generated && (
                  <span className="text-[10px] font-mono text-serial-emerald bg-serial-emerald/10 border border-serial-emerald/20 px-1.5 py-0.5 rounded">
                    GENERATED
                  </span>
                )}
              </div>
              {generated && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? '✓ COPIED' : 'COPY'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    DOWNLOAD .{exportFormat === 'markdown' ? 'md' : exportFormat}
                  </Button>
                </div>
              )}
            </div>

            {/* Preview body */}
            <div className="flex-1 overflow-y-auto max-h-[640px]">
              {!generated && !generating && (
                <div className="flex flex-col items-center justify-center h-full py-24 gap-4 text-serial-text-muted">
                  <div className="w-12 h-12 rounded-xl bg-serial-surface2 border border-serial-border flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm">Configure report settings and click Generate</p>
                  <p className="text-xs text-serial-text-muted/60">Preview will appear here</p>
                </div>
              )}

              {generating && (
                <div className="flex flex-col items-center justify-center h-full py-24 gap-4">
                  <div className="w-8 h-8 border-2 border-serial-violet border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-serial-text-secondary">Generating report...</p>
                  <p className="text-xs text-serial-text-muted">Aggregating findings and lab data</p>
                </div>
              )}

              {generated && !generating && (
                <div className="p-5">
                  <div className="mb-4 pb-4 border-b border-serial-border">
                    <p className="text-xs font-mono text-serial-text-muted">
                      {mockReport.title} · {mockReport.generatedAt}
                    </p>
                  </div>
                  <pre className="text-xs text-serial-text-secondary font-mono whitespace-pre-wrap leading-relaxed">
                    {mockReport.content}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
