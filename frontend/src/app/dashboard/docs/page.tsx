'use client';

import React, { useState } from 'react';

const DOC_SECTIONS = [
  'Introduction',
  'Deserialization Primer',
  'Python Pickle Security',
  'Java Serialization Security',
  '.NET Serialization Security',
  'Gadget Chains',
  'ML Model Security',
  'Scanner Detection',
  'OOB Concepts',
  'Defensive Engineering',
  'Architecture',
  'API Reference',
  'CLI Reference',
  'Security Model',
];

const CONTENT: Record<string, React.ReactNode> = {
  Introduction: (
    <div className="prose-custom">
      <h2 className="text-lg font-bold text-serial-text mb-4">Introduction to DEHYDRATE</h2>
      <p className="text-sm text-serial-text-secondary leading-relaxed mb-4">
        DEHYDRATE (Insecure Deserialization &amp; Vulnerability Exploitation Research Kit) is a cross-language deserialization security research and training platform. It provides a structured environment for studying insecure deserialization vulnerabilities across Python, Java, and .NET ecosystems.
      </p>
      <h3 className="text-sm font-semibold text-serial-text mt-6 mb-3">Platform Capabilities</h3>
      <ul className="space-y-2 text-sm text-serial-text-secondary">
        {[
          'Python pickle protocol analysis (v0–v5)',
          'Java serialization and ObjectInputStream research',
          '.NET ViewState and BinaryFormatter analysis',
          'Interactive gadget chain visualization',
          'ML model serialization risk assessment',
          'Multi-scanner detection comparison',
          'Out-of-band callback confirmation',
          'Runtime environment fingerprinting',
        ].map(c => (
          <li key={c} className="flex items-start gap-2">
            <span className="text-serial-violet mt-0.5">▸</span>
            <span>{c}</span>
          </li>
        ))}
      </ul>
      <h3 className="text-sm font-semibold text-serial-text mt-6 mb-3">Research Ethics</h3>
      <p className="text-sm text-serial-text-secondary leading-relaxed">
        All research conducted in DEHYDRATE is performed in isolated, sandboxed lab environments. The platform uses synthetic execution markers and contained callbacks. No actual exploit code is distributed or executed outside lab boundaries.
      </p>
      <div className="mt-6 p-4 rounded-xl bg-serial-emerald/10 border border-serial-emerald/30">
        <p className="text-xs font-mono text-serial-emerald">AUTHORIZED RESEARCH ENVIRONMENT — All activities are logged and contained.</p>
      </div>
    </div>
  ),
  'Python Pickle Security': (
    <div className="prose-custom">
      <h2 className="text-lg font-bold text-serial-text mb-4">Python Pickle Security</h2>
      <h3 className="text-sm font-semibold text-serial-text mb-3">Pickle Protocol Overview</h3>
      <p className="text-sm text-serial-text-secondary leading-relaxed mb-4">
        Python&apos;s pickle module serializes Python objects into a byte stream using a stack-based virtual machine with ~50 opcodes. Versions 0–5 progressively added efficiency improvements, but all share the fundamental design that allows arbitrary code execution.
      </p>
      <h3 className="text-sm font-semibold text-serial-text mb-3">Protocol Versions</h3>
      <div className="bg-black/60 border border-serial-border rounded-xl p-4 font-mono text-xs mb-4">
        <div className="text-serial-text-muted mb-2"># Protocol selection</div>
        <div className="text-serial-cyan">v0: ASCII-based (human readable)</div>
        <div className="text-serial-cyan">v1: Binary extension of v0</div>
        <div className="text-serial-cyan">v2: Efficient new-style class support</div>
        <div className="text-serial-cyan">v3: Bytes object support (Python 3)</div>
        <div className="text-serial-cyan">v4: Large object support (Python 3.4+)</div>
        <div className="text-serial-cyan">v5: Out-of-band buffers (Python 3.8+)</div>
      </div>
      <h3 className="text-sm font-semibold text-serial-text mb-3">The __reduce__ Method</h3>
      <p className="text-sm text-serial-text-secondary leading-relaxed mb-3">
        When pickle serializes an object, it calls <code className="bg-serial-surface3 px-1 rounded text-serial-cyan">__reduce__</code> to get reconstruction instructions. This returns a tuple of <code className="bg-serial-surface3 px-1 rounded text-serial-cyan">(callable, args)</code>. During deserialization, pickle executes <code className="bg-serial-surface3 px-1 rounded text-serial-cyan">callable(*args)</code>.
      </p>
      <div className="bg-black/60 border border-serial-border rounded-xl p-4 font-mono text-xs mb-4">
        <div className="text-serial-text-muted mb-2"># Educational representation — not executable exploit</div>
        <div className="text-serial-cyan">class ResearchObject:</div>
        <div className="text-serial-cyan pl-4">def __reduce__(self):</div>
        <div className="text-serial-text-muted pl-8"># Returns: (callable, args)</div>
        <div className="text-serial-text-muted pl-8"># pickle will call: callable(*args)</div>
        <div className="text-serial-cyan pl-8">return (str, (&apos;SERIAL_MARKER&apos;,))</div>
      </div>
      <h3 className="text-sm font-semibold text-serial-text mb-3">Dangerous Opcodes</h3>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { op: 'REDUCE (R)', desc: 'Calls a function with arguments from the stack' },
          { op: 'GLOBAL (c)', desc: 'Pushes a global name (module.name) onto the stack' },
          { op: 'INST (i)', desc: 'Older form that creates a class instance' },
          { op: 'OBJECT (o)', desc: 'Creates an object from class and args' },
        ].map(({ op, desc }) => (
          <div key={op} className="bg-serial-surface2 border border-serial-border rounded-xl p-3">
            <div className="text-xs font-mono text-serial-amber mb-1">{op}</div>
            <div className="text-xs text-serial-text-muted">{desc}</div>
          </div>
        ))}
      </div>
      <h3 className="text-sm font-semibold text-serial-text mb-3">Mitigation Strategies</h3>
      <ul className="space-y-2 text-sm text-serial-text-secondary">
        {[
          'Replace pickle with JSON, MessagePack, or Protocol Buffers',
          'Implement RestrictedUnpickler with explicit class allowlist',
          'Never deserialize data from untrusted sources',
          'Wrap deserialization in seccomp/nsjail sandbox',
          'Use cryptographic signatures to verify serialized data',
          'Scan model files with PickleScan/ModelScan before loading',
        ].map(m => (
          <li key={m} className="flex items-start gap-2">
            <span className="text-serial-emerald mt-0.5">✓</span>
            <span>{m}</span>
          </li>
        ))}
      </ul>
    </div>
  ),
};

const STUB = (title: string) => (
  <div>
    <h2 className="text-lg font-bold text-serial-text mb-4">{title}</h2>
    <div className="p-6 rounded-xl bg-serial-surface2 border border-serial-border text-center">
      <p className="text-sm text-serial-text-muted">Section coming soon</p>
    </div>
    <ul className="mt-6 space-y-2">
      {[
        `Overview of ${title}`,
        'Key vulnerability patterns',
        'Detection methods',
        'Real-world examples',
        'Mitigation strategies',
      ].map(i => (
        <li key={i} className="text-xs text-serial-text-muted flex items-center gap-2">
          <span className="text-serial-border-light">○</span> {i}
        </li>
      ))}
    </ul>
  </div>
);

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('Introduction');

  const content = CONTENT[activeSection] ?? STUB(activeSection);

  return (
    <div>
      <h1 className="text-xl font-bold text-serial-text mb-6">Documentation</h1>
      <div className="flex gap-6 h-[calc(100vh-160px)]">
        {/* Sidebar */}
        <nav className="w-48 shrink-0 overflow-y-auto">
          <div className="space-y-0.5">
            {DOC_SECTIONS.map(section => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                  activeSection === section
                    ? 'bg-serial-violet/15 text-serial-violet border border-serial-violet/25'
                    : 'text-serial-text-muted hover:text-serial-text hover:bg-serial-surface2 border border-transparent'
                }`}
              >
                {section}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 bg-serial-surface border border-serial-border rounded-2xl p-8 overflow-y-auto">
          {content}
        </div>
      </div>
    </div>
  );
}
