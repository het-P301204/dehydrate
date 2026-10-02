'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, AlertTriangle, TrendingUp, GitBranch, ScanLine, Swords, Search, FileText, Database } from 'lucide-react';
import { Metric } from '@/components/ui/Metric';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { FlowDiagram } from '@/components/ui/FlowDiagram';
import { Terminal } from '@/components/ui/Terminal';
import { SeverityBadge } from '@/components/ui/Badge';
import { findings } from '@/lib/mock/findings';
import { recentActivity } from '@/lib/mock/events';

const workflowSteps = [
  { label: 'FINGERPRINT' },
  { label: 'OBJECT ANALYSIS' },
  { label: 'CHAIN SELECTION' },
  { label: 'SERIALIZATION' },
  { label: 'SCANNER TEST' },
  { label: 'LAB EXECUTION', active: true },
  { label: 'CALLBACK' },
  { label: 'FINDING' },
];

const QUICK_ACTIONS = [
  { label: 'Run Pickle Scan', icon: <ScanLine size={20} />, href: '/dashboard/scanner', color: 'text-serial-violet' },
  { label: 'Inspect Object', icon: <Search size={20} />, href: '/dashboard/inspector', color: 'text-serial-cyan' },
  { label: 'Explore Gadgets', icon: <GitBranch size={20} />, href: '/dashboard/gadgets', color: 'text-serial-amber' },
  { label: 'Generate Report', icon: <FileText size={20} />, href: '/dashboard/reports', color: 'text-serial-emerald' },
];

function ThreatScoreWidget() {
  const [score, setScore] = useState(0);
  const target = 87;

  useEffect(() => {
    const start = Date.now();
    const duration = 1400;
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setScore(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  const filled = Math.round((score / 100) * 10);
  const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);

  return (
    <Card>
      <CardBody>
        <div className="text-xs font-mono text-serial-text-muted tracking-widest mb-4">DEHYDRATION RISK SCORE</div>
        <div className="flex items-end justify-between mb-2">
          <div className="text-4xl font-bold text-serial-crimson tabular-nums">{score}</div>
          <div className="text-sm font-mono text-serial-text-muted">/100</div>
        </div>
        <div className="text-lg font-mono text-serial-crimson tracking-widest mb-3">{bar}</div>
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-serial-crimson/15 border border-serial-crimson/30 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-serial-crimson animate-pulse" />
          <span className="text-xs font-mono text-serial-crimson font-semibold">HIGH RISK</span>
        </div>
        <div className="text-[10px] font-mono text-serial-text-muted leading-relaxed border-t border-serial-border pt-3">
          Based on: Python Pickle · Remote Deserialization · Unauthenticated Input
        </div>
      </CardBody>
    </Card>
  );
}

function SessionTimer() {
  const [seconds, setSeconds] = useState(763); // 12:43 initial
  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return <span className="text-serial-emerald">{m}:{s}</span>;
}

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-serial-text mb-6">Dashboard</h1>

      {/* Metrics */}
      <div className="grid grid-cols-5 gap-4">
        <Metric value={3} label="Active Labs" icon={<LayoutDashboard size={16} />} />
        <Metric value={7} label="Findings" icon={<AlertTriangle size={16} />} />
        <Metric value={64} label="Research Progress" suffix="%" icon={<TrendingUp size={16} />} />
        <Metric value={23} label="Gadget Chains" icon={<GitBranch size={16} />} />
        <Metric value={87} label="Scanner Coverage" suffix="%" icon={<ScanLine size={16} />} />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-3 gap-6 mt-6">
        {/* Left column */}
        <div className="col-span-2 space-y-4">
          {/* Active Lab */}
          <Card>
            <CardHeader title="ACTIVE LAB" />
            <CardBody>
              <div className="font-mono text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-serial-text-muted">Active Lab:</span>
                  <span className="text-serial-text">Python Pickle Sandbox</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-serial-text-muted">Runtime:</span>
                  <span className="text-serial-cyan">Python 3.11</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-serial-text-muted">Serialization:</span>
                  <span className="text-serial-text">Pickle v5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-serial-text-muted">Risk Surface:</span>
                  <span className="text-serial-amber">Deserialization</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-serial-text-muted">Session:</span>
                  <span className="font-mono text-xs"><SessionTimer /> active</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-serial-border">
                  <span className="text-serial-text-muted">Status:</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-serial-emerald animate-pulse" />
                    <span className="text-serial-emerald">RUNNING</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader title="QUICK ACTIONS" />
            <CardBody>
              <div className="grid grid-cols-4 gap-3">
                {QUICK_ACTIONS.map(action => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-serial-border hover:border-serial-violet/40 bg-serial-surface2 hover:bg-serial-surface3 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group"
                  >
                    <span className={`${action.color} group-hover:scale-110 transition-transform`}>{action.icon}</span>
                    <span className="text-[10px] font-mono text-serial-text-muted text-center leading-snug">{action.label}</span>
                  </Link>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Research Workflow */}
          <Card>
            <CardHeader title="RESEARCH WORKFLOW" />
            <CardBody>
              <FlowDiagram steps={workflowSteps} />
            </CardBody>
          </Card>

          {/* Recent Findings */}
          <Card>
            <CardHeader title="RECENT FINDINGS" />
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-serial-border">
                    <th className="px-4 py-2.5 text-left font-mono text-serial-text-muted tracking-wide">ID</th>
                    <th className="px-4 py-2.5 text-left font-mono text-serial-text-muted tracking-wide">TITLE</th>
                    <th className="px-4 py-2.5 text-left font-mono text-serial-text-muted tracking-wide">SEVERITY</th>
                    <th className="px-4 py-2.5 text-left font-mono text-serial-text-muted tracking-wide">FORMAT</th>
                    <th className="px-4 py-2.5 text-left font-mono text-serial-text-muted tracking-wide">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {findings.slice(0, 5).map((f) => (
                    <tr key={f.id} className="border-b border-serial-border hover:bg-serial-surface2 transition-colors">
                      <td className="px-4 py-3 font-mono text-serial-text-muted">{f.id}</td>
                      <td className="px-4 py-3 text-serial-text max-w-xs truncate">{f.title}</td>
                      <td className="px-4 py-3"><SeverityBadge severity={f.severity} /></td>
                      <td className="px-4 py-3 text-serial-text-muted">{f.format}</td>
                      <td className="px-4 py-3">
                        <span className={`font-mono ${f.status === 'Open' ? 'text-serial-amber' : f.status === 'Remediated' ? 'text-serial-emerald' : 'text-serial-cyan'}`}>
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Threat Score */}
          <ThreatScoreWidget />

          <Card>
            <CardHeader title="RECENT ACTIVITY" />
            <CardBody>
              <Terminal entries={recentActivity} maxHeight="280px" title="" />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="LAB STATS" />
            <CardBody>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-serial-text-muted">Sessions Today</span>
                  <span className="text-serial-text">4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-serial-text-muted">Labs Completed</span>
                  <span className="text-serial-emerald">2 / 25</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-serial-text-muted">Callbacks Received</span>
                  <span className="text-serial-text">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-serial-text-muted">Scan Runs</span>
                  <span className="text-serial-text">7</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
