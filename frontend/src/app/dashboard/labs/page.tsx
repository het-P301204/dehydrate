'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { labs } from '@/lib/mock/labs';
import type { LabDifficulty, LabLanguage, LabStatus } from '@/lib/mock/labs';
import { Badge, SeverityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const DIFFICULTIES: Array<'All' | LabDifficulty> = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
const LANGUAGES: Array<'All' | LabLanguage> = ['All', 'Python', 'Java', '.NET', 'Multi'];
const STATUSES: Array<'All' | LabStatus> = ['All', 'Not Started', 'In Progress', 'Completed'];

function difficultyBadgeVariant(d: LabDifficulty) {
  if (d === 'Beginner') return 'low';
  if (d === 'Intermediate') return 'info';
  if (d === 'Advanced') return 'medium';
  return 'critical'; // Expert
}

function languageBadgeVariant(l: LabLanguage) {
  if (l === 'Python') return 'low';
  if (l === 'Java') return 'medium';
  if (l === '.NET') return 'info';
  return 'default'; // Multi
}

function statusDot(s: LabStatus) {
  if (s === 'Completed') return 'bg-serial-emerald';
  if (s === 'In Progress') return 'bg-serial-amber';
  return 'bg-serial-text-muted';
}

function statusText(s: LabStatus) {
  if (s === 'Completed') return 'text-serial-emerald';
  if (s === 'In Progress') return 'text-serial-amber';
  return 'text-serial-text-muted';
}

export default function LabsPage() {
  const [filterDifficulty, setFilterDifficulty] = useState<'All' | LabDifficulty>('All');
  const [filterLanguage, setFilterLanguage] = useState<'All' | LabLanguage>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | LabStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    return labs.filter(lab => {
      if (filterDifficulty !== 'All' && lab.difficulty !== filterDifficulty) return false;
      if (filterLanguage !== 'All' && lab.language !== filterLanguage) return false;
      if (filterStatus !== 'All' && lab.status !== filterStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          lab.title.toLowerCase().includes(q) ||
          lab.description.toLowerCase().includes(q) ||
          lab.tags.some(t => t.includes(q))
        );
      }
      return true;
    });
  }, [filterDifficulty, filterLanguage, filterStatus, searchQuery]);

  const completed = labs.filter(l => l.status === 'Completed').length;
  const inProgress = labs.filter(l => l.status === 'In Progress').length;
  const notStarted = labs.filter(l => l.status === 'Not Started').length;

  const filterBtnClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
      active
        ? 'bg-serial-violet text-white border border-serial-violet/50'
        : 'bg-serial-surface2 text-serial-text-secondary border border-serial-border hover:border-serial-border-light hover:text-serial-text'
    }`;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-serial-text tracking-tight">Labs</h1>
        <p className="text-sm text-serial-text-muted mt-1">
          25 guided research modules across Python, Java, and .NET serialization
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-serial-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search labs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-serial-surface2 border border-serial-border rounded-xl text-sm text-serial-text placeholder:text-serial-text-muted focus:outline-none focus:border-serial-border-light"
          />
        </div>

        {/* Difficulty */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-serial-text-muted font-mono w-20 shrink-0">DIFFICULTY</span>
          {DIFFICULTIES.map(d => (
            <button key={d} onClick={() => setFilterDifficulty(d)} className={filterBtnClass(filterDifficulty === d)}>
              {d}
            </button>
          ))}
        </div>

        {/* Language */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-serial-text-muted font-mono w-20 shrink-0">LANGUAGE</span>
          {LANGUAGES.map(l => (
            <button key={l} onClick={() => setFilterLanguage(l)} className={filterBtnClass(filterLanguage === l)}>
              {l}
            </button>
          ))}
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-serial-text-muted font-mono w-20 shrink-0">STATUS</span>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={filterBtnClass(filterStatus === s)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs font-mono text-serial-text-muted border-b border-serial-border pb-4">
        <span className="text-serial-text">{labs.length} Labs</span>
        <span>·</span>
        <span className="text-serial-emerald">{completed} Completed</span>
        <span>·</span>
        <span className="text-serial-amber">{inProgress} In Progress</span>
        <span>·</span>
        <span>{notStarted} Not Started</span>
        {filtered.length !== labs.length && (
          <>
            <span>·</span>
            <span className="text-serial-violet">{filtered.length} shown</span>
          </>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-serial-text-muted">
          <p className="text-sm">No labs match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(lab => (
            <Card key={lab.id} hoverable className="p-4 flex flex-col gap-3">
              {/* Top row */}
              <div className="flex items-start justify-between">
                <span className="text-2xl font-mono font-bold text-serial-text-muted/40">
                  {String(lab.id).padStart(2, '0')}
                </span>
                <div className="flex items-center gap-1.5">
                  <Badge variant={languageBadgeVariant(lab.language) as 'low' | 'medium' | 'info' | 'default'}>
                    {lab.language}
                  </Badge>
                  <Badge variant={difficultyBadgeVariant(lab.difficulty) as 'low' | 'info' | 'medium' | 'critical'}>
                    {lab.difficulty}
                  </Badge>
                </div>
              </div>

              {/* Title & description */}
              <div>
                <p className="text-sm font-semibold text-serial-text">{lab.title}</p>
                <p className="text-xs text-serial-text-muted mt-1 line-clamp-2">{lab.description}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {lab.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[10px] font-mono text-serial-text-muted bg-serial-surface3 border border-serial-border rounded px-1.5 py-0.5">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-serial-border">
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${statusDot(lab.status)}`} />
                  <span className={`text-xs font-mono ${statusText(lab.status)}`}>{lab.status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-serial-text-muted">{lab.estimatedMinutes}m</span>
                  <Link href={`/dashboard/labs/${lab.id}`}>
                    <Button size="sm" variant={lab.status === 'Completed' ? 'outline' : 'primary'}>
                      {lab.status === 'Completed' ? 'REVIEW' : lab.status === 'In Progress' ? 'CONTINUE' : 'START LAB'}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
