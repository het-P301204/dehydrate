'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Terminal } from '@/components/ui/Terminal';
import { researchEvents, type TimelineEvent } from '@/lib/mock/events';

const RUNTIMES = ['Python 3.11', 'Java 11', '.NET 6', 'Python (ML)'];
const FORMATS = ['Pickle', 'Java Serialization', 'ViewState', 'ONNX'];
const LABS = ['Python Pickle Sandbox', 'Java ObjectInputStream Lab', '.NET BinaryFormatter Lab', 'PyTorch Model Lab'];
const MODULES = ['Object Parser', 'Chain Analyzer', 'Callback Engine', 'Scanner'];

const DEFAULT_CODE = `# LAB SIMULATION — Not executable code
# Python Pickle Deserialization Research
# DEHYDRATE Lab Environment v1.0

import pickle  # Conceptual representation

class ResearchObject:
    """
    Demonstrates __reduce__ protocol.
    In real systems, this controls object reconstruction.
    """
    def __reduce__(self):
        # Returns: (callable, args)
        # Deserializer calls: callable(*args)
        return (str, ("SERIAL_LAB_MARKER",))

# Serialize
data = pickle.dumps(ResearchObject())

# The bytes above represent this structure:
# PROTO 2
# GLOBAL 'builtins str'
# MARK
#   SHORT_BINSTRING 'SERIAL_LAB_MARKER'
# TUPLE1
# REDUCE
# .
`;

const MOCK_OUTPUTS: Record<string, string> = {
  raw: `\x80\x02cbuiltins\nstr\nq\x00X\x11\x00\x00\x00SERIAL_LAB_MARKERq\x01\x85q\x02Rq\x03.`,
  base64: `gAJjYnVpbHRpbnMKc3RyCnEAWBEAAABTRVJJQUxfTEFCX01BUktFUnEBhXECUnEDLg==`,
  hex: `80 02 63 62 75 69 6c 74 69 6e 73 0a 73 74 72 0a 71 00 58 11 00 00 00 53 45 52 49 41 4c 5f 4c 41 42 5f 4d 41 52 4b 45 52 71 01 85 71 02 52 71 03 2e`,
};

let nextEventId = 100;

export default function ResearchLabPage() {
  const [runtime, setRuntime] = useState('Python 3.11');
  const [format, setFormat] = useState('Pickle');
  const [lab, setLab] = useState(LABS[0]);
  const [modules, setModules] = useState<Record<string, boolean>>(
    Object.fromEntries(MODULES.map(m => [m, true]))
  );
  const [code, setCode] = useState(DEFAULT_CODE);
  const [outputTab, setOutputTab] = useState<'raw' | 'base64' | 'hex'>('base64');
  const [events, setEvents] = useState<TimelineEvent[]>(researchEvents);
  const [sessionActive, setSessionActive] = useState(false);

  const toggleModule = (m: string) => setModules(prev => ({ ...prev, [m]: !prev[m] }));

  const startSession = () => {
    setSessionActive(true);
    setEvents([{
      id: `ev-${nextEventId++}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'success',
      message: `Session started: ${runtime} / ${format}`,
      source: 'session-manager',
    }, ...events]);
  };

  const addSimEvent = () => {
    const newEvent: TimelineEvent = {
      id: `ev-${nextEventId++}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      message: 'Object analyzed: __reduce__ method detected',
      source: 'analyzer',
    };
    setEvents(prev => [newEvent, ...prev]);
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-serial-text mb-6">Research Lab</h1>
      <div className="flex gap-4 h-[calc(100vh-160px)] overflow-hidden">
        {/* Left Panel — Environment */}
        <div className="w-56 shrink-0 bg-serial-surface border border-serial-border rounded-2xl p-4 overflow-y-auto space-y-5">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-serial-text-muted mb-2">RUNTIME</div>
            <div className="space-y-1">
              {RUNTIMES.map(r => (
                <button
                  key={r}
                  onClick={() => setRuntime(r)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors ${runtime === r ? 'bg-serial-violet/15 text-serial-violet border border-serial-violet/25' : 'text-serial-text-muted hover:bg-serial-surface2 border border-transparent'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono tracking-widest text-serial-text-muted mb-2">FORMAT</div>
            <div className="space-y-1">
              {FORMATS.map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors ${format === f ? 'bg-serial-cyan/10 text-serial-cyan border border-serial-cyan/25' : 'text-serial-text-muted hover:bg-serial-surface2 border border-transparent'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono tracking-widest text-serial-text-muted mb-2">TARGET LAB</div>
            <select
              value={lab}
              onChange={e => setLab(e.target.value)}
              className="w-full bg-serial-surface2 border border-serial-border rounded-lg px-2 py-2 text-xs font-mono text-serial-text outline-none"
            >
              {LABS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <div className="text-[10px] font-mono tracking-widest text-serial-text-muted mb-2">MODULES</div>
            <div className="space-y-2">
              {MODULES.map(m => (
                <label key={m} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modules[m]}
                    onChange={() => toggleModule(m)}
                    className="accent-serial-violet"
                  />
                  <span className="text-xs font-mono text-serial-text-muted">{m}</span>
                </label>
              ))}
            </div>
          </div>
          <Button onClick={startSession} className="w-full" size="sm">
            {sessionActive ? 'ACTIVE' : 'START SESSION'}
          </Button>
        </div>

        {/* Center Panel — Workspace */}
        <div className="flex-1 bg-serial-surface border border-serial-border rounded-2xl flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-serial-border bg-serial-surface2">
            {['Format', 'Inspect', 'Simulate', 'Run in Lab'].map(action => (
              <button
                key={action}
                onClick={action === 'Simulate' ? addSimEvent : undefined}
                className="px-3 py-1 text-xs font-mono text-serial-text-muted hover:text-serial-text border border-serial-border hover:border-serial-border-light rounded-lg transition-colors"
              >
                {action}
              </button>
            ))}
            <div className="ml-auto text-xs font-mono text-serial-text-muted">{runtime} · {format}</div>
          </div>

          {/* Editor */}
          <div className="flex-1 relative overflow-hidden">
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              className="w-full h-full bg-black/60 text-serial-cyan font-mono text-xs p-4 resize-none outline-none leading-relaxed"
              spellCheck={false}
            />
            <div className="absolute bottom-4 right-4 text-xs font-mono text-serial-text-muted/20 pointer-events-none tracking-widest select-none">
              AUTHORIZED LAB ONLY
            </div>
          </div>

          {/* Output tabs */}
          <div className="border-t border-serial-border">
            <div className="flex border-b border-serial-border px-2">
              {(['raw', 'base64', 'hex'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setOutputTab(tab)}
                  className={`px-4 py-2 text-xs font-mono tracking-wide transition-colors ${outputTab === tab ? 'text-serial-violet border-b border-serial-violet' : 'text-serial-text-muted hover:text-serial-text'}`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="p-3 font-mono text-xs text-serial-cyan bg-black/40 max-h-24 overflow-auto">
              <span className="text-serial-text-muted text-[10px] mr-2">[OUTPUT]</span>
              {MOCK_OUTPUTS[outputTab]}
            </div>
          </div>
        </div>

        {/* Right Panel — Timeline */}
        <div className="w-64 shrink-0 bg-serial-surface border border-serial-border rounded-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-serial-border">
            <span className="text-xs font-mono tracking-widest text-serial-text-muted">EXECUTION TIMELINE</span>
            <button
              onClick={() => setEvents([])}
              className="text-[10px] font-mono text-serial-text-muted hover:text-serial-crimson transition-colors"
            >
              CLEAR
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <Terminal entries={events} maxHeight="100%" title="" />
          </div>
        </div>
      </div>
    </div>
  );
}
