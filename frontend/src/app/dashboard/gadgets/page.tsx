'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type NodeTypes,
  type NodeProps,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { gadgetChains } from '@/lib/mock/gadgets';
import { Badge, SeverityBadge } from '@/components/ui/Badge';

type Language = 'All' | 'Python' | 'Java' | '.NET';

interface ChainNodeData extends Record<string, unknown> {
  label: string;
  type: string;
  className: string;
  pkg: string;
  significance: string;
  mitigation: string;
}

type ChainNode = Node<ChainNodeData>;

// Custom node components — defined outside the parent to avoid re-registration on every render

function InputNodeComponent({ data }: NodeProps<ChainNode>) {
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div className="bg-serial-surface2 rounded-xl px-4 py-2 text-xs font-mono border-2 border-serial-violet text-serial-text">
        {data.label}
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
}

function DeserializerNodeComponent({ data }: NodeProps<ChainNode>) {
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div className="bg-serial-surface2 rounded-xl px-4 py-2 text-xs font-mono border-2 border-serial-cyan text-serial-text">
        {data.label}
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
}

function GadgetNodeComponent({ data }: NodeProps<ChainNode>) {
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div className="bg-serial-surface2 rounded-xl px-4 py-2 text-xs font-mono border-2 border-serial-amber text-serial-text">
        {data.label}
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
}

function TransformNodeComponent({ data }: NodeProps<ChainNode>) {
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div className="bg-serial-surface2 rounded-xl px-4 py-2 text-xs font-mono border-2 border-serial-border-light text-serial-text">
        {data.label}
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
}

function ExecutionNodeComponent({ data }: NodeProps<ChainNode>) {
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div className="bg-serial-surface2 rounded-xl px-4 py-2 text-xs font-mono border-2 border-serial-crimson text-serial-text">
        {data.label}
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
}

const nodeTypesMap: NodeTypes = {
  InputNode: InputNodeComponent,
  DeserializerNode: DeserializerNodeComponent,
  GadgetNode: GadgetNodeComponent,
  TransformNode: TransformNodeComponent,
  execution: ExecutionNodeComponent,
};

const LANGUAGE_FILTERS: Language[] = ['All', 'Python', 'Java', '.NET'];

const CHAIN_NARRATIVES: Record<string, string> = {
  'gc-001':
    'The attacker serializes a Python object using the pickle module. When the target application calls pickle.loads() on the received bytes, the __reduce__ hook fires automatically. Python\'s protocol calls os.system() with the attacker-supplied shell command — achieving arbitrary OS-level code execution without any additional interaction.',
  'gc-002':
    'The attacker sends a crafted Java serialized payload. ObjectInputStream reads the stream and encounters InvokerTransformer, which is chained through CommonsCollections to ultimately call Runtime.exec() — achieving arbitrary OS command execution inside the JVM process context.',
  'gc-003':
    'The attacker submits a crafted .NET BinaryFormatter payload. The formatter reconstructs the object graph and encounters ObjectStateFormatter, which triggers a delegate chain through TypeConfuseDelegate that ultimately reaches Process.Start() — executing arbitrary commands under the ASP.NET worker process identity.',
};

function getChainNarrative(chainId: string, chain: { name: string; language: string; description: string }): string {
  return CHAIN_NARRATIVES[chainId] ?? `The attacker crafts a ${chain.language} serialized payload exploiting the ${chain.name} gadget chain. During deserialization the runtime reconstructs the object graph, traversing the gadget chain until an unsafe callable is reached — ${chain.description.toLowerCase()}`;
}

function processNodes(rawNodes: Node[]): ChainNode[] {
  return rawNodes.map((node) => {
    const dataType = (node.data as ChainNodeData).type as string;
    return {
      ...node,
      type: dataType,
    } as ChainNode;
  });
}

export default function GadgetChainsPage() {
  const [selectedChainId, setSelectedChainId] = useState<string>(gadgetChains[0].id);
  const [languageFilter, setLanguageFilter] = useState<Language>('All');
  const [selectedNodeData, setSelectedNodeData] = useState<ChainNodeData | null>(null);

  const selectedChain = useMemo(
    () => gadgetChains.find((c) => c.id === selectedChainId) ?? gadgetChains[0],
    [selectedChainId]
  );

  const filteredChains = useMemo(
    () =>
      gadgetChains.filter(
        (c) => languageFilter === 'All' || c.language === languageFilter
      ),
    [languageFilter]
  );

  const initialNodes = useMemo(() => processNodes(selectedChain.nodes), [selectedChain]);
  const initialEdges = useMemo(() => selectedChain.edges, [selectedChain]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync nodes/edges when chain changes
  const handleChainSelect = useCallback(
    (chainId: string) => {
      const chain = gadgetChains.find((c) => c.id === chainId);
      if (!chain) return;
      setSelectedChainId(chainId);
      setNodes(processNodes(chain.nodes));
      setEdges(chain.edges);
      setSelectedNodeData(null);
    },
    [setNodes, setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeData(node.data as ChainNodeData);
  }, []);

  const severityBorderClass: Record<string, string> = {
    CRITICAL: 'border-l-serial-crimson',
    HIGH: 'border-l-orange-500',
    MEDIUM: 'border-l-serial-amber',
  };

  return (
    <div className="h-[calc(100vh-120px)] flex gap-0 overflow-hidden">
      {/* LEFT PANEL — chain list */}
      <div className="w-64 border-r border-serial-border p-4 flex flex-col gap-3 overflow-y-auto">
        <div className="text-xs font-semibold font-mono text-serial-text tracking-widest">
          GADGET CHAINS
        </div>

        {/* Language filter with counts */}
        <div className="flex flex-wrap gap-1">
          {LANGUAGE_FILTERS.map((lang) => {
            const count = lang === 'All' ? gadgetChains.length : gadgetChains.filter(c => c.language === lang).length;
            return (
              <button
                key={lang}
                onClick={() => setLanguageFilter(lang)}
                className={`px-2 py-0.5 text-xs font-mono rounded-md border transition-colors cursor-pointer flex items-center gap-1 ${
                  languageFilter === lang
                    ? 'bg-serial-violet/20 border-serial-violet text-serial-violet'
                    : 'bg-transparent border-serial-border text-serial-text-muted hover:border-serial-border-light hover:text-serial-text-secondary'
                }`}
              >
                {lang}
                <span className="text-[9px] opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Chain list */}
        <div className="flex flex-col gap-2 flex-1">
          {filteredChains.map((chain) => (
            <button
              key={chain.id}
              onClick={() => handleChainSelect(chain.id)}
              className={`w-full text-left p-2.5 rounded-xl border-l-2 border border-serial-border transition-all duration-150 cursor-pointer ${
                selectedChainId === chain.id
                  ? `bg-serial-surface3 border-serial-violet ${severityBorderClass[chain.severity] ?? 'border-l-serial-violet'}`
                  : `bg-serial-surface hover:bg-serial-surface2 ${severityBorderClass[chain.severity] ?? 'border-l-transparent'}`
              }`}
            >
              <div className="text-xs font-mono text-serial-text leading-snug mb-1">
                {chain.name}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <SeverityBadge severity={chain.severity} />
                <span className="text-xs font-mono text-serial-text-muted truncate">
                  {chain.affectedLibrary}
                </span>
              </div>
            </button>
          ))}
          {filteredChains.length === 0 && (
            <p className="text-xs font-mono text-serial-text-muted text-center py-4">
              No chains for this filter
            </p>
          )}
        </div>
      </div>

      {/* CENTER PANEL — ReactFlow */}
      <div className="flex-1 bg-black/80 flex flex-col overflow-hidden">
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypesMap}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#2A2A2A" gap={20} />
            <Controls
              style={{ background: '#141414', border: '1px solid #2A2A2A' }}
            />
            <MiniMap
              style={{ background: '#141414', border: '1px solid #2A2A2A' }}
              nodeColor="#8B5CF6"
            />
          </ReactFlow>
        </div>

        {/* Disclaimer bar */}
        <div className="border-t border-serial-border p-3">
          <p className="text-xs font-mono text-serial-amber text-center">
            All chains are conceptual demonstrations for research and education. No actual exploit code is present.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL — node inspector */}
      <div className="w-72 border-l border-serial-border p-4 overflow-y-auto flex flex-col gap-4">
        <div className="text-xs font-semibold font-mono text-serial-text tracking-widest">
          NODE INSPECTOR
        </div>

        {selectedNodeData ? (
          <div className="space-y-4">
            {/* Node type badge */}
            <div className="flex items-center gap-2">
              <NodeTypeBadge type={selectedNodeData.type} />
            </div>

            {/* Fields */}
            <Field label="Class Name" value={selectedNodeData.className} mono />
            <Field label="Package / Library" value={selectedNodeData.pkg} mono />

            <div className="border-t border-serial-border/50 pt-4">
              <Field label="Security Significance" value={selectedNodeData.significance} />
            </div>

            <div className="border-t border-serial-border/50 pt-4">
              <div className="text-xs text-serial-text-muted mb-1 font-mono">Mitigation</div>
              <div className="bg-serial-emerald/10 border border-serial-emerald/20 rounded-lg p-2.5 text-xs text-serial-emerald font-mono leading-relaxed">
                {selectedNodeData.mitigation}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs font-mono text-serial-text-muted text-center leading-relaxed px-4">
              Click a node to inspect it
            </p>
          </div>
        )}

        {/* Chain description */}
        <div className="mt-auto border-t border-serial-border pt-4">
          <div className="text-xs text-serial-text-muted mb-1 font-mono">Active Chain</div>
          <div className="text-xs font-mono text-serial-text-secondary leading-relaxed">
            {selectedChain.description}
          </div>
        </div>

        {/* Chain Composition panel */}
        <div className="border-t border-serial-border pt-4">
          <div className="text-xs text-serial-text-muted mb-2 font-mono tracking-widest">CHAIN COMPOSITION</div>
          <div className="bg-serial-violet/5 border border-serial-violet/15 rounded-xl p-3">
            <div className="text-[10px] font-mono text-serial-violet mb-2 tracking-wide">ATTACK NARRATIVE</div>
            <p className="text-xs text-serial-text-secondary leading-relaxed">
              {getChainNarrative(selectedChain.id, selectedChain)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NodeTypeBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; variant: React.ComponentProps<typeof Badge>['variant'] }> = {
    InputNode: { label: 'INPUT', variant: 'low' },
    DeserializerNode: { label: 'DESERIALIZER', variant: 'info' },
    GadgetNode: { label: 'GADGET', variant: 'medium' },
    TransformNode: { label: 'TRANSFORM', variant: 'default' },
    execution: { label: 'EXECUTION', variant: 'critical' },
  };
  const config = map[type] ?? { label: type.toUpperCase(), variant: 'default' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs text-serial-text-muted mb-1 font-mono">{label}</div>
      <div
        className={`text-xs text-serial-text leading-relaxed ${mono ? 'font-mono text-serial-cyan' : ''}`}
      >
        {value}
      </div>
    </div>
  );
}
