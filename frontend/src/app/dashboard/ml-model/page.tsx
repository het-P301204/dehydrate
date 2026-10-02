'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { FlowDiagram } from '@/components/ui/FlowDiagram';
import { Badge } from '@/components/ui/Badge';

const SYNTHETIC_MODELS = [
  { id: 'pytorch', name: 'torch_model.pkl', format: 'PyTorch Pickle', safe: false, size: '2.1 MB', icon: 'PT', ext: '.pkl' },
  { id: 'sklearn', name: 'sklearn_pipeline.pkl', format: 'scikit-learn', safe: false, size: '384 KB', icon: 'SK', ext: '.pkl' },
  { id: 'safetensors', name: 'safe_model.safetensors', format: 'SafeTensors', safe: true, size: '1.8 MB', icon: 'ST', ext: '.safetensors' },
  { id: 'onnx', name: 'onnx_model.onnx', format: 'ONNX', safe: true, size: '2.4 MB', icon: 'OX', ext: '.onnx' },
];

const MODEL_TREES: Record<string, string> = {
  pytorch: `PyTorch Archive (ZIP)
├── storage.pkl         ← Pickle serialized
│   ├── __reduce__: torch.storage.  _load_from_bytes
│   └── reduce_args: [b'\\x80\\x05...']
├── data/
│   └── 0              ← Tensor bytes
└── metadata.pkl        ← SUSPICIOUS ⚠
    └── __reduce__: subprocess.Popen
        └── args: ['SERIAL_LAB_MARKER']`,
  sklearn: `sklearn Pipeline (Pickle)
├── Pipeline.__reduce__()
│   ├── steps:
│   │   ├── ('scaler', StandardScaler)
│   │   └── ('clf', RandomForestClassifier)
│   └── SUSPICIOUS: embedded __reduce__ ⚠
│       └── callable: os.system`,
  safetensors: `SafeTensors Archive
├── header.json         ← Pure JSON metadata
│   ├── dtype: float32
│   ├── shape: [768, 768]
│   └── data_offsets: [0, 2359296]
└── data.bin            ← Raw binary tensors only
    └── No code execution possible ✓`,
  onnx: `ONNX Model (Protocol Buffers)
├── ModelProto
│   ├── ir_version: 8
│   ├── opset_import: [ai.onnx v17]
│   └── graph: GraphProto
│       ├── nodes: [MatMul, Add, ReLU...]
│       └── inputs/outputs: typed tensors
└── No arbitrary code ✓`,
};

const flowSteps = [
  { label: 'MODEL FILE' },
  { label: 'SERIALIZED ARTIFACT' },
  { label: 'MODEL LOADER' },
  { label: 'DESERIALIZER' },
  { label: 'OBJECT GRAPH' },
  { label: 'RISK', highlight: true },
];

export default function MLModelLabPage() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const model = SYNTHETIC_MODELS.find(m => m.id === selectedModel);

  return (
    <div>
      <h1 className="text-xl font-bold text-serial-text mb-4">ML Model Lab</h1>
      <p className="text-xs text-serial-text-muted mb-6">Analyze ML model serialization formats and deserialization risk</p>

      {/* Pipeline */}
      <FlowDiagram steps={flowSteps} className="mb-6" />

      <div className="grid grid-cols-2 gap-6">
        {/* Left — Upload + Models */}
        <div className="space-y-4">
          {/* Drag zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); }}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${dragging ? 'border-serial-violet bg-serial-violet/5' : 'border-serial-border hover:border-serial-border-light'}`}
          >
            <div className="text-3xl mb-3">📦</div>
            <p className="text-sm text-serial-text-muted font-mono">Drop synthetic model file here</p>
            <p className="text-xs text-serial-text-muted/60 mt-1">.pkl .safetensors .onnx .h5</p>
          </div>

          <div className="text-center text-xs text-serial-text-muted font-mono">— OR SELECT PRE-BUILT —</div>

          {/* Model cards */}
          <div className="space-y-2">
            {SYNTHETIC_MODELS.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border text-left transition-colors ${selectedModel === m.id ? 'border-serial-violet bg-serial-violet/10' : 'border-serial-border hover:border-serial-border-light'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-mono font-bold ${m.safe ? 'bg-serial-emerald/15 text-serial-emerald' : 'bg-serial-crimson/15 text-serial-crimson'}`}>
                  {m.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-serial-text font-medium truncate">{m.name}</div>
                  <div className="text-xs text-serial-text-muted">{m.format} · {m.size}</div>
                </div>
                <Badge variant={m.safe ? 'success' : 'critical'}>
                  {m.safe ? 'SAFE' : 'UNSAFE'}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Right — Analysis + Comparison */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="ANALYSIS RESULTS" subtitle={model?.name} />
            <CardBody>
              {!model ? (
                <div className="text-xs text-serial-text-muted font-mono text-center py-8">
                  Select a model to analyze
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <Badge variant={model.safe ? 'success' : 'critical'}>
                      {model.safe ? 'SAFE FORMAT' : 'UNSAFE — PICKLE BACKEND'}
                    </Badge>
                  </div>

                  {/* Object graph tree */}
                  <div className="bg-black/60 border border-serial-border rounded-xl p-4 font-mono text-xs text-serial-text-secondary mb-4 whitespace-pre overflow-auto max-h-52">
                    {MODEL_TREES[model.id]}
                  </div>

                  {!model.safe && (
                    <div>
                      <div className="text-[10px] font-mono tracking-widest text-serial-text-muted mb-2">SUSPICIOUS OPERATIONS</div>
                      <div className="space-y-1">
                        {['__reduce__ override detected', 'subprocess module reference', 'os.system callable'].map(op => (
                          <div key={op} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-serial-crimson shrink-0" />
                            <span className="text-xs text-serial-crimson">{op}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {model.safe && (
                    <div className="text-xs text-serial-emerald font-mono">
                      ✓ No code execution paths detected. Format uses structured data only.
                    </div>
                  )}
                </>
              )}
            </CardBody>
          </Card>

          {/* Comparison table */}
          <Card>
            <CardHeader title="FORMAT COMPARISON" />
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-serial-border">
                    {['Format', 'Backend', 'Arb. Code', 'Safe Default'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left font-mono text-serial-text-muted tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Pickle (.pkl)', 'pickle', 'YES', 'NO'],
                    ['SafeTensors', 'JSON/binary', 'NO', 'YES'],
                    ['ONNX', 'Protobuf', 'NO', 'YES'],
                    ['PyTorch archive', 'pickle', 'YES', 'NO'],
                    ['H5/HDF5', 'numpy+pickle', 'MAYBE', 'PARTIAL'],
                  ].map(([f, b, ac, sd]) => (
                    <tr key={f} className="border-b border-serial-border">
                      <td className="px-4 py-2.5 text-serial-text">{f}</td>
                      <td className="px-4 py-2.5 text-serial-text-muted font-mono">{b}</td>
                      <td className={`px-4 py-2.5 font-mono font-bold ${ac === 'YES' ? 'text-serial-crimson' : ac === 'NO' ? 'text-serial-emerald' : 'text-serial-amber'}`}>{ac}</td>
                      <td className={`px-4 py-2.5 font-mono ${sd === 'YES' ? 'text-serial-emerald' : sd === 'NO' ? 'text-serial-crimson' : 'text-serial-amber'}`}>{sd}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
