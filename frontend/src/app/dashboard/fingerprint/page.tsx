'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';

const REPORT_LINES = [
  { text: 'RUNTIME FINGERPRINT REPORT', type: 'header' },
  { text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', type: 'separator' },
  { text: '', type: 'blank' },
  { text: 'Language:         Python 3.11.4', type: 'normal' },
  { text: 'Platform:         Linux (Docker sandbox)', type: 'normal' },
  { text: 'Serialization:    Pickle v5 (ENABLED)', type: 'normal' },
  { text: '', type: 'blank' },
  { text: 'Installed Libraries:', type: 'section' },
  { text: '  PyTorch 2.1.0   ⚠  Unsafe deserialization possible', type: 'warn' },
  { text: '  scikit-learn    ✓  Compatible', type: 'safe' },
  { text: '  Celery 5.3.1    ⚠  Remote task deserialization', type: 'warn' },
  { text: '  Flask 3.0.0     ✓  No direct exposure', type: 'safe' },
  { text: '  Dask 2023.12    ⚠  Distributed deserialization', type: 'warn' },
  { text: '  numpy 1.26.0    ✓  Safe', type: 'safe' },
  { text: '  redis-py 5.0    ⚠  Broker for Celery tasks', type: 'warn' },
  { text: '', type: 'blank' },
  { text: 'Risk Indicators:', type: 'section' },
  { text: '  [HIGH] Unsafe pickle deserialization boundary detected', type: 'high' },
  { text: '  [MED]  Remote task execution via Celery workers', type: 'med' },
  { text: '  [LOW]  Model loading without signature verification', type: 'low' },
  { text: '', type: 'blank' },
  { text: 'Attack Surface:', type: 'section' },
  { text: '  Celery broker port exposed: POTENTIALLY', type: 'warn' },
  { text: '  Deserialization endpoint: /api/process (DETECTED)', type: 'high' },
  { text: '  Model load path: ./models/ (UNPROTECTED)', type: 'warn' },
  { text: '', type: 'blank' },
  { text: 'Confidence: HIGH (Lab Environment)', type: 'normal' },
  { text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', type: 'separator' },
];

const lineColor: Record<string, string> = {
  header: 'text-serial-violet font-semibold',
  separator: 'text-serial-violet/50',
  blank: '',
  normal: 'text-serial-text-secondary',
  section: 'text-serial-text',
  warn: 'text-serial-amber',
  safe: 'text-serial-emerald',
  high: 'text-serial-crimson',
  med: 'text-serial-amber',
  low: 'text-serial-cyan',
};

export default function FingerprintPage() {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [scanning, setScanning] = useState(false);

  const runScan = useCallback(() => {
    setVisibleLines(0);
    setScanning(true);
  }, []);

  useEffect(() => {
    runScan();
  }, [runScan]);

  useEffect(() => {
    if (!scanning) return;
    if (visibleLines >= REPORT_LINES.length) {
      setScanning(false);
      return;
    }
    const t = setTimeout(() => setVisibleLines(v => v + 1), 80);
    return () => clearTimeout(t);
  }, [scanning, visibleLines]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-serial-text">Runtime Fingerprint</h1>
          <p className="text-xs text-serial-text-muted mt-1">Identify deserialization libraries and attack surface</p>
        </div>
        <Button onClick={runScan} loading={scanning}>
          {scanning ? 'SCANNING...' : 'SCAN ENVIRONMENT'}
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Report */}
        <div className="col-span-3">
          <div className="bg-black/60 border border-serial-border rounded-2xl p-6 font-mono text-xs min-h-96">
            {REPORT_LINES.slice(0, visibleLines).map((line, i) => (
              <div key={i} className={`leading-relaxed ${lineColor[line.type] ?? 'text-serial-text-secondary'}`}>
                {line.text || ' '}
              </div>
            ))}
            {scanning && (
              <span className="inline-block w-2 h-3.5 bg-serial-violet animate-pulse ml-0.5" />
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          {[
            { label: 'Libraries Scanned', value: '7', color: 'text-serial-text' },
            { label: 'Risk Indicators', value: '3', color: 'text-serial-amber' },
            { label: 'Confirmed Unsafe', value: '2', color: 'text-serial-crimson' },
            { label: 'Confidence', value: 'HIGH', color: 'text-serial-emerald' },
          ].map(stat => (
            <Card key={stat.label}>
              <CardBody>
                <div className="text-[10px] font-mono tracking-widest text-serial-text-muted mb-1">{stat.label}</div>
                <div className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
              </CardBody>
            </Card>
          ))}
          <Card>
            <CardBody>
              <div className="text-[10px] font-mono tracking-widest text-serial-text-muted mb-2">SCAN STATUS</div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${scanning ? 'bg-serial-amber animate-pulse' : 'bg-serial-emerald'}`} />
                <span className="text-xs font-mono text-serial-text">{scanning ? 'SCANNING' : 'COMPLETE'}</span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
