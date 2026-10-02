'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { FlowDiagram } from '@/components/ui/FlowDiagram';

const SAMPLES = [
  { id: 'pickle-basic', name: 'Python Pickle Basic', format: 'Pickle', size: '124 B' },
  { id: 'java-serial', name: 'Java Serialized Object', format: 'Java', size: '287 B' },
  { id: 'viewstate', name: '.NET ViewState Sample', format: '.NET', size: '412 B' },
  { id: 'pytorch-model', name: 'PyTorch Model (.pkl)', format: 'ML Pickle', size: '2.1 MB' },
  { id: 'celery-task', name: 'Celery Task Message', format: 'Pickle', size: '88 B' },
  { id: 'dask-graph', name: 'Dask Task Graph', format: 'Pickle', size: '156 B' },
  { id: 'yaml-payload', name: 'YAML Payload', format: 'YAML', size: '64 B' },
  { id: 'ml-pipeline', name: 'sklearn Pipeline', format: 'ML Pickle', size: '384 KB' },
];

const SCANNERS = ['PickleScan', 'ModelScan', 'DEHYDRATE Custom Detector'];

interface ScanResult {
  status: 'DETECTED' | 'SUSPICIOUS' | 'NOT_DETECTED';
  confidence: number;
  indicators: string[];
  explanation: string;
}

function getScanResult(sample: string, scanner: string): ScanResult {
  if (scanner === 'DEHYDRATE Custom Detector') {
    return {
      status: 'DETECTED',
      confidence: 95,
      indicators: ['__reduce__ opcode sequence', 'os.system reference', 'GLOBAL opcode', 'REDUCE at offset 0x18'],
      explanation: 'DEHYDRATE Custom Detector identified dangerous opcode patterns and module references using behavioral analysis and YARA rules.',
    };
  }
  if (scanner === 'PickleScan') {
    if (sample === 'viewstate' || sample === 'java-serial') {
      return { status: 'NOT_DETECTED', confidence: 0, indicators: [], explanation: 'PickleScan is Python-specific and does not analyze this format.' };
    }
    if (sample === 'yaml-payload') {
      return { status: 'SUSPICIOUS', confidence: 45, indicators: ['python/object tag detected'], explanation: 'PickleScan found a YAML-embedded Python object tag which may indicate deserialization risk.' };
    }
    return {
      status: 'DETECTED',
      confidence: 82,
      indicators: ['__reduce__ opcode', 'os.system call reference', 'REDUCE opcode at 0x18'],
      explanation: 'PickleScan detected dangerous pickle opcode sequences indicating potential code execution.',
    };
  }
  // ModelScan
  if (sample === 'pytorch-model' || sample === 'ml-pipeline') {
    return {
      status: 'SUSPICIOUS',
      confidence: 67,
      indicators: ['Pickle backend detected', 'No SafeTensors alternative'],
      explanation: 'ModelScan found pickle-based model format without safer alternative. Requires manual inspection.',
    };
  }
  return { status: 'NOT_DETECTED', confidence: 15, indicators: [], explanation: 'ModelScan is designed for ML model files. This format is outside its detection scope.' };
}

const statusColors: Record<string, string> = {
  DETECTED: 'text-serial-crimson bg-serial-crimson/10 border-serial-crimson/30',
  SUSPICIOUS: 'text-serial-amber bg-serial-amber/10 border-serial-amber/30',
  NOT_DETECTED: 'text-serial-emerald bg-serial-emerald/10 border-serial-emerald/30',
};

const flowSteps = [
  { label: 'Sample' },
  { label: 'Scanner' },
  { label: 'Detection Engine' },
  { label: 'Indicators' },
  { label: 'Result' },
];

export default function ScannerLabPage() {
  const [selectedSample, setSelectedSample] = useState('pickle-basic');
  const [selectedScanner, setSelectedScanner] = useState('PickleScan');
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);

  const runScan = () => {
    setScanning(true);
    setProgress(0);
    setResult(null);
    let p = 0;
    const interval = setInterval(() => {
      p += 6;
      setProgress(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setScanning(false);
          setResult(getScanResult(selectedSample, selectedScanner));
        }, 300);
      }
    }, 80);
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-serial-text mb-4">Scanner Lab</h1>

      <div className="mb-6">
        <FlowDiagram steps={flowSteps} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left — Config */}
        <div className="space-y-5">
          <Card>
            <CardHeader title="SELECT SAMPLE" />
            <CardBody className="space-y-2">
              {SAMPLES.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedSample(s.id); setResult(null); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-colors ${selectedSample === s.id ? 'border-serial-violet bg-serial-violet/10 text-serial-text' : 'border-serial-border hover:border-serial-border-light text-serial-text-muted'}`}
                >
                  <span className="font-medium text-left truncate">{s.name}</span>
                  <div className="flex gap-1 shrink-0 ml-2">
                    <Badge variant="default">{s.format}</Badge>
                  </div>
                </button>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="SELECT SCANNER" />
            <CardBody className="space-y-2">
              {SCANNERS.map(sc => (
                <button
                  key={sc}
                  onClick={() => { setSelectedScanner(sc); setResult(null); }}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono text-left transition-colors ${selectedScanner === sc ? 'border-serial-cyan bg-serial-cyan/10 text-serial-cyan' : 'border-serial-border hover:border-serial-border-light text-serial-text-muted'}`}
                >
                  {sc}
                </button>
              ))}
            </CardBody>
          </Card>

          <Button onClick={runScan} loading={scanning} className="w-full" size="lg">
            RUN SCAN
          </Button>
        </div>

        {/* Right — Results */}
        <div className="col-span-2 space-y-4">
          {scanning && (
            <Card>
              <CardBody>
                <div className="text-xs font-mono text-serial-text-muted mb-3">Scanning with {selectedScanner}...</div>
                <ProgressBar value={progress} color="bg-serial-violet" />
              </CardBody>
            </Card>
          )}

          {result && (
            <Card>
              <CardHeader title="SCAN RESULT" />
              <CardBody>
                <div className="flex items-center gap-4 mb-6">
                  <span className={`px-4 py-2 rounded-xl border text-sm font-mono font-bold ${statusColors[result.status]}`}>
                    {result.status}
                  </span>
                  {result.status !== 'NOT_DETECTED' && (
                    <div className="flex-1">
                      <ProgressBar value={result.confidence} label={`Confidence`} color={result.status === 'DETECTED' ? 'bg-serial-crimson' : 'bg-serial-amber'} />
                    </div>
                  )}
                </div>
                {result.indicators.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-mono text-serial-text-muted mb-2 tracking-wide">INDICATORS</div>
                    <div className="space-y-1">
                      {result.indicators.map((ind, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-serial-crimson text-xs">▸</span>
                          <span className="text-xs font-mono text-serial-text-secondary">{ind}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="text-xs text-serial-text-secondary leading-relaxed">{result.explanation}</div>
              </CardBody>
            </Card>
          )}

          {/* Detection Coverage */}
          <Card>
            <CardHeader title="DETECTION COVERAGE COMPARISON" />
            <CardBody className="space-y-4">
              {[
                { name: 'PickleScan', value: 82, color: 'bg-serial-cyan' },
                { name: 'ModelScan', value: 68, color: 'bg-serial-amber' },
                { name: 'DEHYDRATE Custom', value: 95, color: 'bg-serial-violet' },
              ].map(sc => (
                <ProgressBar key={sc.name} value={sc.value} label={sc.name} color={sc.color} />
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
