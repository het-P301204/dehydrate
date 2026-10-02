'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Terminal } from '@/components/ui/Terminal';
import { callbackEvents, type TimelineEvent } from '@/lib/mock/events';

const FLOW_STEPS = ['LAB', 'DESERIALIZATION', 'PROOF OF EXECUTION', 'CALLBACK', 'EVENT LOG'];

let nextId = 10;

export default function CallbackLabPage() {
  const [events, setEvents] = useState<TimelineEvent[]>(callbackEvents);
  const [pulseStep, setPulseStep] = useState(-1);
  const [triggerActive, setTriggerActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => { timerRef.current.forEach(clearTimeout); timerRef.current = []; };

  const triggerTest = () => {
    if (triggerActive) return;
    clearTimers();
    setTriggerActive(true);
    setPulseStep(0);

    FLOW_STEPS.forEach((_, i) => {
      const t = setTimeout(() => setPulseStep(i), i * 500);
      timerRef.current.push(t);
    });

    const addEventTimer = setTimeout(() => {
      const now = new Date().toLocaleTimeString();
      const newEvents: TimelineEvent[] = [
        { id: `cb-new-${nextId++}`, timestamp: now, type: 'info', message: 'LAB EVENT: Pickle deserialization initiated', source: 'python-pickle-lab' },
        { id: `cb-new-${nextId++}`, timestamp: now, type: 'success', message: 'CALLBACK: DEHYDRATE_LAB_EXECUTION_CONFIRMED', source: 'callback-server' },
        { id: `cb-new-${nextId++}`, timestamp: now, type: 'info', message: `EVENT: callback_id=cb_${Math.random().toString(36).slice(2, 8)} source=python-pickle-lab`, source: 'callback-server' },
        { id: `cb-new-${nextId++}`, timestamp: now, type: 'error', message: 'FINDING: Unsafe deserialization boundary confirmed', source: 'analysis-engine' },
      ];
      setEvents(prev => [...newEvents, ...prev]);
      setPulseStep(-1);
      setTriggerActive(false);
    }, FLOW_STEPS.length * 500 + 500);
    timerRef.current.push(addEventTimer);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-serial-text">Callback Lab</h1>
          <p className="text-xs text-serial-text-muted mt-1">Out-of-band execution confirmation via synthetic callbacks</p>
        </div>
        <Button onClick={triggerTest} loading={triggerActive}>
          TRIGGER TEST
        </Button>
      </div>

      {/* Flow animation */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex items-center gap-2 justify-center flex-wrap py-4">
            {FLOW_STEPS.map((step, i) => (
              <React.Fragment key={i}>
                <div
                  className={`px-5 py-3 rounded-xl border text-xs font-mono tracking-wide transition-all duration-400 ${
                    pulseStep === i
                      ? 'border-serial-violet bg-serial-violet/20 text-serial-violet shadow-lg shadow-serial-violet/20'
                      : pulseStep > i
                      ? 'border-serial-emerald/40 bg-serial-emerald/10 text-serial-emerald'
                      : 'border-serial-border bg-serial-surface2 text-serial-text-muted'
                  }`}
                >
                  {step}
                </div>
                {i < FLOW_STEPS.length - 1 && (
                  <div className={`text-sm transition-colors duration-300 ${pulseStep > i ? 'text-serial-emerald' : 'text-serial-text-muted/40'}`}>
                    →
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          {triggerActive && (
            <div className="text-center mt-2">
              <span className="text-xs font-mono text-serial-violet animate-pulse">
                Executing lab sequence... step {pulseStep + 1} / {FLOW_STEPS.length}
              </span>
            </div>
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Event log */}
        <div className="col-span-1">
          <Card className="h-full">
            <CardHeader title="CALLBACK EVENT LOG" />
            <CardBody>
              <Terminal entries={events} title="" maxHeight="400px" />
            </CardBody>
          </Card>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="ABOUT OOB CALLBACKS" />
            <CardBody>
              <div className="text-xs text-serial-text-secondary leading-relaxed space-y-3">
                <p>
                  Out-of-band (OOB) callbacks confirm that deserialization executed arbitrary code when direct output observation is not possible (blind deserialization).
                </p>
                <p>
                  In this lab, the deserializer executes a synthetic marker payload. The execution triggers an HTTP or DNS callback to the DEHYDRATE lab server, confirming the code path was reached.
                </p>
                <p>
                  This technique is used in security research to verify deserialization vulnerabilities when the application does not return visible error output.
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="LAB CONFIGURATION" />
            <CardBody>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-serial-text-muted">Runtime</span>
                  <span className="text-serial-cyan">Python 3.11</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-serial-text-muted">Format</span>
                  <span className="text-serial-text">Pickle v5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-serial-text-muted">Callback Type</span>
                  <span className="text-serial-amber">HTTP (localhost)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-serial-text-muted">Marker</span>
                  <span className="text-serial-emerald">DEHYDRATE_LAB_EXECUTION_CONFIRMED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-serial-text-muted">Sandbox</span>
                  <span className="text-serial-emerald">ACTIVE (Docker)</span>
                </div>
              </div>
            </CardBody>
          </Card>

          <div className="p-4 rounded-xl bg-serial-amber/10 border border-serial-amber/30">
            <p className="text-xs font-mono text-serial-amber">
              ⚠ LAB SIMULATION — All callbacks are synthetic and contained within the authorized lab environment. No external network connections are made.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
