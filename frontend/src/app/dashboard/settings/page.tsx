'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [endpoint, setEndpoint] = useState('http://localhost:8000');
  const [timeout, setTimeout_] = useState('60s');
  const [sandbox, setSandbox] = useState(true);
  const [notifications, setNotifications] = useState({
    callbacks: true,
    findings: true,
    labComplete: false,
    scanResults: true,
  });
  const [resetConfirm, setResetConfirm] = useState(false);

  const toggleNotif = (key: string) =>
    setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));

  return (
    <div>
      <h1 className="text-xl font-bold text-serial-text mb-6">Settings</h1>
      <div className="max-w-2xl space-y-6">

        {/* Appearance */}
        <Card>
          <CardHeader title="APPEARANCE" />
          <CardBody>
            <div className="grid grid-cols-2 gap-3">
              {(['dark', 'light'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                    theme === t ? 'border-serial-violet bg-serial-violet/10' : 'border-serial-border hover:border-serial-border-light'
                  }`}
                >
                  <span className="text-sm font-medium text-serial-text capitalize">{t}</span>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${theme === t ? 'border-serial-violet' : 'border-serial-border'}`}>
                    {theme === t && <div className="w-2 h-2 rounded-full bg-serial-violet" />}
                  </div>
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Lab Environment */}
        <Card>
          <CardHeader title="LAB ENVIRONMENT" />
          <CardBody className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-serial-text-muted mb-2 tracking-wide">API ENDPOINT</label>
              <input
                type="text"
                value={endpoint}
                onChange={e => setEndpoint(e.target.value)}
                className="w-full bg-serial-surface2 border border-serial-border rounded-xl px-4 py-2.5 text-sm text-serial-text font-mono outline-none focus:border-serial-border-light"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-serial-text-muted mb-2 tracking-wide">RUNTIME TIMEOUT</label>
              <div className="flex gap-2">
                {['30s', '60s', '120s', '300s'].map(t => (
                  <button
                    key={t}
                    onClick={() => setTimeout_(t)}
                    className={`flex-1 py-2 rounded-xl border text-xs font-mono transition-colors ${timeout === t ? 'border-serial-cyan bg-serial-cyan/10 text-serial-cyan' : 'border-serial-border text-serial-text-muted hover:border-serial-border-light'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-serial-text">Sandbox Mode</div>
                <div className="text-xs text-serial-text-muted">Isolate all lab executions in Docker sandbox</div>
              </div>
              <button
                onClick={() => setSandbox(!sandbox)}
                className={`relative w-11 h-6 rounded-full transition-colors ${sandbox ? 'bg-serial-emerald' : 'bg-serial-surface3'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${sandbox ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </CardBody>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader title="NOTIFICATIONS" />
          <CardBody className="space-y-3">
            {[
              { key: 'callbacks', label: 'Callback received', desc: 'Notify when OOB callback arrives' },
              { key: 'findings', label: 'New finding created', desc: 'Alert on critical/high findings' },
              { key: 'labComplete', label: 'Lab completed', desc: 'Notify when a lab is finished' },
              { key: 'scanResults', label: 'Scan results ready', desc: 'Alert when scanner run completes' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm text-serial-text">{label}</div>
                  <div className="text-xs text-serial-text-muted">{desc}</div>
                </div>
                <button
                  onClick={() => toggleNotif(key)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${notifications[key as keyof typeof notifications] ? 'bg-serial-violet' : 'bg-serial-surface3'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications[key as keyof typeof notifications] ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Danger Zone */}
        <div className="rounded-2xl border border-serial-crimson/30 bg-serial-crimson/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-serial-crimson/20">
            <h3 className="text-sm font-semibold text-serial-crimson">DANGER ZONE</h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-serial-text">Reset All Labs</div>
                <div className="text-xs text-serial-text-muted">This will reset all lab progress and cannot be undone</div>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setResetConfirm(!resetConfirm)}
              >
                {resetConfirm ? 'CONFIRM RESET' : 'RESET LABS'}
              </Button>
            </div>
            {resetConfirm && (
              <div className="p-3 rounded-xl bg-serial-crimson/10 border border-serial-crimson/30">
                <p className="text-xs font-mono text-serial-crimson">
                  Click CONFIRM RESET again to permanently reset all lab progress. This action cannot be undone.
                </p>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-serial-crimson/20 pt-4">
              <div>
                <div className="text-sm text-serial-text">Clear Session Data</div>
                <div className="text-xs text-serial-text-muted">Clear all cached session data and logs</div>
              </div>
              <Button variant="danger" size="sm">CLEAR DATA</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
