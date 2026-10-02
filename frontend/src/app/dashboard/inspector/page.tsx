'use client';

import React, { useState, useCallback } from 'react';
import { samples, type Sample, type ObjectNode } from '@/lib/mock/samples';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';

type ActiveTab = 'samples' | 'paste';

const FORMAT_VARIANT_MAP: Record<string, React.ComponentProps<typeof Badge>['variant']> = {
  'Pickle v2': 'critical',
  'Pickle v5 (PyTorch)': 'critical',
  'Java Serialization': 'high',
  'ViewState': 'medium',
};

const RISK_SCORE_MAP: Record<Sample['riskLevel'], number> = {
  SAFE: 12,
  SUSPICIOUS: 55,
  DANGEROUS: 87,
};

const RISK_COLOR_MAP: Record<Sample['riskLevel'], string> = {
  SAFE: 'bg-serial-emerald',
  SUSPICIOUS: 'bg-serial-amber',
  DANGEROUS: 'bg-serial-crimson',
};

const RISK_BADGE_MAP: Record<Sample['riskLevel'], React.ComponentProps<typeof Badge>['variant']> = {
  SAFE: 'success',
  SUSPICIOUS: 'medium',
  DANGEROUS: 'critical',
};

// Derive suspicious operations from the object tree
function collectSuspicious(nodes: ObjectNode[]): string[] {
  const results: string[] = [];
  function walk(node: ObjectNode) {
    if (node.suspicious) {
      results.push(node.label);
    }
    node.children?.forEach(walk);
  }
  nodes.forEach(walk);
  return results;
}

// Static "dangerous reconstruction primitives" per format
const DANGEROUS_PRIMITIVES: Record<string, string[]> = {
  'Pickle v2': ['__reduce__', 'GLOBAL opcode', 'REDUCE opcode'],
  'Pickle v5 (PyTorch)': ['__reduce__', 'GLOBAL opcode', 'torch.load() passthrough'],
  'Java Serialization': ['ObjectInputStream.readObject()', 'InvokerTransformer.transform()', 'Runtime.exec()'],
  'ViewState': ['BinaryFormatter.Deserialize()', 'TypeRef resolution', 'Missing MAC signature'],
};

// Recursive tree node component
interface ObjectTreeNodeProps {
  node: ObjectNode;
  depth: number;
  isLast: boolean;
  expanded: Set<string>;
  onToggle: (id: string) => void;
}

function ObjectTreeNode({ node, depth, isLast, expanded, onToggle }: ObjectTreeNodeProps) {
  const hasChildren = (node.children?.length ?? 0) > 0;
  const isExpanded = expanded.has(node.id);
  const indent = depth * 16;

  const prefix = depth === 0 ? '' : isLast ? '└─ ' : '├─ ';

  return (
    <div>
      <div
        className={`flex items-start gap-1 py-0.5 rounded px-1 ${
          node.suspicious
            ? 'bg-serial-crimson/5 hover:bg-serial-crimson/10'
            : 'hover:bg-serial-surface3/50'
        } ${hasChildren ? 'cursor-pointer' : ''}`}
        style={{ paddingLeft: `${indent + 4}px` }}
        onClick={hasChildren ? () => onToggle(node.id) : undefined}
      >
        {/* Expand/collapse indicator */}
        {hasChildren && (
          <span className="text-serial-text-muted font-mono text-xs w-3 shrink-0 leading-relaxed">
            {isExpanded ? '▾' : '▸'}
          </span>
        )}
        {!hasChildren && <span className="w-3 shrink-0" />}

        {/* Tree prefix */}
        <span className="text-serial-text-muted font-mono text-xs leading-relaxed shrink-0 select-none">
          {prefix}
        </span>

        {/* Label */}
        <span
          className={`font-mono text-xs leading-relaxed ${
            node.suspicious ? 'text-serial-crimson' : 'text-serial-text-secondary'
          }`}
        >
          {node.label}
        </span>

        {/* Suspicious indicator */}
        {node.suspicious && (
          <span className="text-serial-amber text-xs ml-1 shrink-0" title="Suspicious node">
            ⚠
          </span>
        )}

        {/* Value */}
        {node.value && (
          <span className="text-serial-text-muted font-mono text-xs ml-1">
            = <span className="text-serial-cyan">{node.value}</span>
          </span>
        )}

        {/* Type tag */}
        <span className="ml-auto shrink-0 text-xs font-mono text-serial-text-muted opacity-60">
          {node.type}
        </span>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && node.children && (
        <div>
          {node.children.map((child, idx) => (
            <ObjectTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              isLast={idx === (node.children?.length ?? 0) - 1}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function InspectorPage() {
  const [selectedSampleId, setSelectedSampleId] = useState<string>(samples[0].id);
  const [pastedInput, setPastedInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('samples');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));

  const selectedSample = samples.find((s) => s.id === selectedSampleId) ?? null;

  const handleSampleSelect = useCallback((id: string) => {
    setSelectedSampleId(id);
    setExpandedNodes(new Set(['root']));
  }, []);

  const handleToggle = useCallback((id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const suspiciousOps = selectedSample
    ? collectSuspicious(selectedSample.objectStructure)
    : [];

  const dangerousPrimitives = selectedSample
    ? (DANGEROUS_PRIMITIVES[selectedSample.format] ?? [])
    : [];

  const riskScore = selectedSample ? RISK_SCORE_MAP[selectedSample.riskLevel] : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-serial-text tracking-wide">Object Inspector</h1>
        <p className="text-sm text-serial-text-muted mt-1">
          Visualize and analyze the internal structure of serialized objects
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* LEFT: Object tree panel */}
        <div className="col-span-2 flex flex-col gap-4">
          <Card>
            <div className="border-b border-serial-border">
              {/* Tabs */}
              <div className="flex gap-1 px-4 pt-4">
                {([
                  { id: 'samples' as ActiveTab, label: 'Pre-built Samples' },
                  { id: 'paste' as ActiveTab, label: 'Custom Input' },
                ] as const).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-2 text-xs font-mono tracking-wide transition-colors duration-150 cursor-pointer ${
                      activeTab === tab.id
                        ? 'border-b-2 border-serial-violet text-serial-violet -mb-px'
                        : 'text-serial-text-muted hover:text-serial-text-secondary'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <CardBody className="space-y-3">
              {activeTab === 'samples' ? (
                <div className="grid grid-cols-2 gap-2">
                  {samples.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleSampleSelect(sample.id)}
                      className={`text-left p-3 rounded-xl border transition-all duration-150 cursor-pointer ${
                        selectedSampleId === sample.id
                          ? 'bg-serial-surface3 border-serial-violet'
                          : 'bg-serial-surface2 border-serial-border hover:border-serial-border-light hover:bg-serial-surface3'
                      }`}
                    >
                      <div className="text-xs font-mono text-serial-text mb-1.5 leading-snug">
                        {sample.name}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant={FORMAT_VARIANT_MAP[sample.format] ?? 'default'}>
                          {sample.format}
                        </Badge>
                        <Badge variant={RISK_BADGE_MAP[sample.riskLevel]}>
                          {sample.riskLevel}
                        </Badge>
                      </div>
                      <div className="text-xs text-serial-text-muted mt-1.5 leading-snug">
                        {sample.description}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-mono text-serial-text-secondary mb-1.5">
                    Paste Base64 or Hex-encoded serialized data
                  </label>
                  <textarea
                    value={pastedInput}
                    onChange={(e) => setPastedInput(e.target.value)}
                    placeholder="gAJjcG9zaXgKc3lzdGVtCnEAWAIAAAAiaWRxAYVxAlJxAy4=&#10;&#10;or&#10;&#10;AC ED 00 05 73 72 00 2E ..."
                    className="w-full h-32 bg-serial-surface3 border border-serial-border text-serial-cyan text-xs font-mono rounded-xl p-3 focus:outline-none focus:border-serial-violet resize-none placeholder:text-serial-text-muted"
                  />
                  <p className="text-xs text-serial-text-muted mt-1.5 font-mono">
                    Static simulation — paste any value to observe tree structure
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Object tree */}
          <Card>
            <CardHeader
              title="OBJECT TREE"
              subtitle={selectedSample ? `${selectedSample.format} · ${selectedSample.size}` : 'Select a sample'}
              action={
                selectedSample && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedNodes(new Set(getAllIds(selectedSample.objectStructure)))}
                      className="text-xs font-mono text-serial-text-muted hover:text-serial-text-secondary transition-colors cursor-pointer"
                    >
                      Expand all
                    </button>
                    <span className="text-serial-border">|</span>
                    <button
                      onClick={() => setExpandedNodes(new Set())}
                      className="text-xs font-mono text-serial-text-muted hover:text-serial-text-secondary transition-colors cursor-pointer"
                    >
                      Collapse all
                    </button>
                  </div>
                )
              }
            />
            <CardBody>
              {selectedSample ? (
                <div className="min-h-[240px] overflow-auto">
                  {selectedSample.objectStructure.map((node, idx) => (
                    <ObjectTreeNode
                      key={node.id}
                      node={node}
                      depth={0}
                      isLast={idx === selectedSample.objectStructure.length - 1}
                      expanded={expandedNodes}
                      onToggle={handleToggle}
                    />
                  ))}
                </div>
              ) : (
                <div className="min-h-[240px] flex items-center justify-center">
                  <p className="text-xs font-mono text-serial-text-muted">
                    Select a sample to view its object tree
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* RIGHT: Analysis panel */}
        <div className="col-span-1">
          <Card className="sticky top-6">
            <CardHeader title="ANALYSIS" />
            <CardBody className="space-y-5">
              {selectedSample ? (
                <>
                  {/* Object type */}
                  <div>
                    <div className="text-xs font-mono text-serial-text-muted mb-1">Object Type</div>
                    <div className="text-sm font-mono text-serial-text">{selectedSample.name}</div>
                  </div>

                  {/* Format detected */}
                  <div>
                    <div className="text-xs font-mono text-serial-text-muted mb-1.5">Format Detected</div>
                    <Badge variant={FORMAT_VARIANT_MAP[selectedSample.format] ?? 'default'}>
                      {selectedSample.format}
                    </Badge>
                  </div>

                  {/* Risk level */}
                  <div>
                    <div className="text-xs font-mono text-serial-text-muted mb-1.5">Risk Level</div>
                    <Badge variant={RISK_BADGE_MAP[selectedSample.riskLevel]}>
                      {selectedSample.riskLevel}
                    </Badge>
                  </div>

                  <div className="border-t border-serial-border/50" />

                  {/* Risk score */}
                  <div>
                    <div className="text-xs font-mono text-serial-text-muted mb-2">Risk Score</div>
                    <ProgressBar
                      value={riskScore}
                      color={RISK_COLOR_MAP[selectedSample.riskLevel]}
                      height="h-2"
                      label=""
                      showValue
                    />
                  </div>

                  {/* Suspicious operations */}
                  {suspiciousOps.length > 0 && (
                    <div>
                      <div className="text-xs font-mono text-serial-text-muted mb-2">
                        Suspicious Operations ({suspiciousOps.length})
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {suspiciousOps.map((op, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <span className="text-serial-crimson text-xs mt-0.5 shrink-0">▸</span>
                            <Badge variant="critical" className="text-left leading-relaxed whitespace-normal">
                              {op}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dangerous reconstruction primitives */}
                  {dangerousPrimitives.length > 0 && (
                    <>
                      <div className="border-t border-serial-border/50" />
                      <div>
                        <div className="text-xs font-mono text-serial-text-muted mb-2">
                          Dangerous Reconstruction Primitives
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {dangerousPrimitives.map((primitive, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-serial-crimson shrink-0" />
                              <span className="text-xs font-mono text-serial-crimson/80">{primitive}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="border-t border-serial-border/50" />

                  {/* Size */}
                  <div>
                    <div className="text-xs font-mono text-serial-text-muted mb-1">Object Size</div>
                    <div className="text-xs font-mono text-serial-text-secondary">{selectedSample.size}</div>
                  </div>
                </>
              ) : (
                <div className="min-h-[240px] flex items-center justify-center">
                  <p className="text-xs font-mono text-serial-text-muted text-center leading-relaxed">
                    Select a sample to view analysis
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper to collect all node IDs for "expand all"
function getAllIds(nodes: ObjectNode[]): string[] {
  const ids: string[] = [];
  function walk(node: ObjectNode) {
    if ((node.children?.length ?? 0) > 0) {
      ids.push(node.id);
    }
    node.children?.forEach(walk);
  }
  nodes.forEach(walk);
  return ids;
}
