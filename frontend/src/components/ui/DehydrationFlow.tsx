'use client';

import React, { useEffect, useRef } from 'react';

interface DehydrationFlowProps {
  className?: string;
  compact?: boolean;
}

const STEPS = [
  { label: 'OBJECT', sublabel: 'In-memory', color: '#8B5CF6' },
  { label: 'SERIALIZE', sublabel: 'Dehydrate', color: '#06B6D4' },
  { label: 'BYTES', sublabel: 'Wire format', color: '#52525B' },
  { label: 'TRANSMIT', sublabel: 'Network', color: '#52525B' },
  { label: 'DESERIALIZE', sublabel: 'Rehydrate', color: '#F59E0B' },
  { label: 'GADGET CHAIN', sublabel: 'Execution path', color: '#EF4444' },
  { label: '⚡ EXPLOIT', sublabel: 'Code runs', color: '#EF4444' },
];

export function DehydrationFlow({ className = '', compact = false }: DehydrationFlowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let offset = 0;
    let alive = true;

    function draw() {
      if (!alive || !canvas || !ctx) return;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Draw animated dashes along two horizontal tracks
      const tracks = [
        { y: H * 0.4, color: '#8B5CF6', speed: 1.2 },
        { y: H * 0.6, color: '#EF4444', speed: 0.8 },
      ];

      tracks.forEach(track => {
        ctx.strokeStyle = track.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.35;
        ctx.setLineDash([6, 10]);
        ctx.lineDashOffset = -offset * track.speed;
        ctx.beginPath();
        ctx.moveTo(0, track.y);
        ctx.lineTo(W, track.y);
        ctx.stroke();
      });

      // Animated droplet particles
      const numDroplets = 5;
      for (let i = 0; i < numDroplets; i++) {
        const t = ((offset * 1.5 + i * (W / numDroplets)) % W) / W;
        const x = t * W;
        const halfPoint = 0.55;
        const isAfterDeserialize = t > halfPoint;
        const color = isAfterDeserialize ? '#EF4444' : '#06B6D4';
        const y = H * 0.5;
        const size = isAfterDeserialize ? 4.5 : 3;
        ctx.globalAlpha = 0.7 + Math.sin(offset * 0.08 + i) * 0.2;
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.globalAlpha = 1;
      ctx.setLineDash([]);

      offset += 0.5;
      animFrameRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      alive = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Canvas for animated particles */}
      <canvas
        ref={canvasRef}
        width={800}
        height={60}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
      />

      {/* Step nodes */}
      <div className={`relative z-10 flex items-center justify-between ${compact ? 'gap-1' : 'gap-2'}`}>
        {STEPS.map((step, i) => {
          const isExploit = i >= 5;
          const isDeserialize = i === 4;
          return (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`
                    ${compact ? 'px-2 py-1 text-[10px]' : 'px-3 py-2 text-xs'}
                    rounded-lg font-mono font-semibold border transition-all duration-300
                    ${isExploit
                      ? 'border-serial-crimson/50 bg-serial-crimson/10 text-serial-crimson shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                      : isDeserialize
                      ? 'border-serial-amber/40 bg-serial-amber/10 text-serial-amber'
                      : i <= 1
                      ? 'border-serial-violet/40 bg-serial-violet/10 text-serial-violet'
                      : 'border-serial-border bg-serial-surface2 text-serial-text-secondary'
                    }
                  `}
                >
                  {step.label}
                </div>
                {!compact && (
                  <span className="text-[9px] font-mono text-serial-text-muted">{step.sublabel}</span>
                )}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 flex items-center justify-center ${compact ? 'mx-0.5' : 'mx-1'}`}
                  style={{ minWidth: compact ? '8px' : '16px' }}
                >
                  <div className={`w-full h-px ${i >= 4 ? 'bg-serial-crimson/40' : i >= 2 ? 'bg-serial-text-muted/20' : 'bg-serial-violet/30'}`} />
                  <span className={`text-[10px] mx-0.5 shrink-0 ${i >= 4 ? 'text-serial-crimson/60' : 'text-serial-text-muted/40'}`}>›</span>
                  <div className={`w-full h-px ${i >= 4 ? 'bg-serial-crimson/40' : i >= 2 ? 'bg-serial-text-muted/20' : 'bg-serial-violet/30'}`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
