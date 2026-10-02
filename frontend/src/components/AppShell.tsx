'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FlaskConical, Package, GitBranch, Search,
  Fingerprint, ScanLine, Brain, Radio, BookOpen,
  AlertTriangle, FileText, BookMarked, Settings,
  ChevronLeft, ChevronRight, Bell, Command, Swords, Database
} from 'lucide-react';
import { SerialLogo } from './SerialLogo';
import { CommandPalette } from './CommandPalette';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={15} /> },
    ],
  },
  {
    title: 'RESEARCH',
    items: [
      { href: '/dashboard/research', label: 'Research Lab', icon: <FlaskConical size={15} /> },
      { href: '/dashboard/payload', label: 'Payload Lab', icon: <Package size={15} /> },
      { href: '/dashboard/gadgets', label: 'Gadget Chains', icon: <GitBranch size={15} /> },
      { href: '/dashboard/inspector', label: 'Object Inspector', icon: <Search size={15} /> },
      { href: '/dashboard/attack-sim', label: 'Attack Simulator', icon: <Swords size={15} /> },
    ],
  },
  {
    title: 'ANALYSIS',
    items: [
      { href: '/dashboard/fingerprint', label: 'Runtime Fingerprint', icon: <Fingerprint size={15} /> },
      { href: '/dashboard/scanner', label: 'Scanner Lab', icon: <ScanLine size={15} /> },
      { href: '/dashboard/ml-model', label: 'ML Model Lab', icon: <Brain size={15} /> },
      { href: '/dashboard/callback', label: 'Callback Lab', icon: <Radio size={15} /> },
    ],
  },
  {
    title: 'LEARNING',
    items: [
      { href: '/dashboard/labs', label: 'Labs', icon: <BookOpen size={15} /> },
    ],
  },
  {
    title: 'REPORTING',
    items: [
      { href: '/dashboard/findings', label: 'Findings', icon: <AlertTriangle size={15} /> },
      { href: '/dashboard/reports', label: 'Reports', icon: <FileText size={15} /> },
    ],
  },
  {
    title: 'REFERENCE',
    items: [
      { href: '/dashboard/cves', label: 'CVE Database', icon: <Database size={15} /> },
      { href: '/dashboard/docs', label: 'Documentation', icon: <BookMarked size={15} /> },
      { href: '/dashboard/settings', label: 'Settings', icon: <Settings size={15} /> },
    ],
  },
];

function NavLink({ href, label, icon }: NavItem) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 group ${
        isActive
          ? 'bg-serial-violet/15 text-serial-violet border border-serial-violet/25'
          : 'text-serial-text-muted hover:text-serial-text hover:bg-serial-surface2 border border-transparent'
      }`}
    >
      <span className={isActive ? 'text-serial-violet' : 'text-serial-text-muted group-hover:text-serial-text-secondary'}>
        {icon}
      </span>
      {label}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const pathname = usePathname();

  const breadcrumb = pathname.replace('/dashboard', '').replace(/^\//, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Dashboard';

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex h-screen bg-serial-bg overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`shrink-0 flex flex-col border-r border-serial-border bg-serial-surface transition-all duration-300 ${collapsed ? 'w-14' : 'w-60'}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-serial-border">
          {!collapsed && <SerialLogo size={24} />}
          {collapsed && <SerialLogo size={24} showText={false} />}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-serial-text-muted hover:text-serial-text transition-colors ml-auto"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
          {navSections.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <div className="px-3 mb-1.5 text-[10px] font-mono tracking-widest text-serial-text-muted/60">
                  {section.title}
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) =>
                  collapsed ? (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={item.label}
                      className={`flex items-center justify-center w-full py-2 rounded-lg transition-colors ${pathname === item.href ? 'text-serial-violet' : 'text-serial-text-muted hover:text-serial-text'}`}
                    >
                      {item.icon}
                    </Link>
                  ) : (
                    <NavLink key={item.href} {...item} />
                  )
                )}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom status */}
        {!collapsed && (
          <div className="px-4 py-4 border-t border-serial-border space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-serial-emerald animate-pulse" />
              <span className="text-xs font-mono text-serial-emerald tracking-wide">LAB MODE</span>
            </div>
            <p className="text-[10px] font-mono text-serial-text-muted/50 tracking-wide">
              AUTHORIZED ENVIRONMENT ONLY
            </p>
          </div>
        )}
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="shrink-0 flex items-center gap-4 px-6 py-3.5 border-b border-serial-border bg-serial-surface/80 backdrop-blur-sm">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-xs font-mono text-serial-text-muted">
              <span>DEHYDRATE</span>
              <span>/</span>
              <span className="text-serial-text-secondary">{breadcrumb}</span>
            </div>
          </div>
          <button
            onClick={() => setCmdOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-serial-surface2 border border-serial-border text-serial-text-muted hover:text-serial-text hover:border-serial-border-light transition-colors text-xs font-mono"
          >
            <Command size={12} />
            <span>K</span>
          </button>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-serial-emerald/10 border border-serial-emerald/25">
            <span className="w-1.5 h-1.5 rounded-full bg-serial-emerald animate-pulse" />
            <span className="text-xs font-mono text-serial-emerald tracking-wide">LAB ACTIVE</span>
          </div>
          <button className="text-serial-text-muted hover:text-serial-text transition-colors">
            <Bell size={16} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Command Palette */}
      {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} />}
    </div>
  );
}
