'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronRight, FlaskConical, Link2, Terminal, GitBranch, Brain, ScanLine, Radio, Fingerprint, GitFork, Shield, Database } from 'lucide-react';
import { SerialLogo } from '@/components/SerialLogo';
import { DehydrationFlow } from '@/components/ui/DehydrationFlow';

// ── Particle canvas ──────────────────────────────────────────────────────────

function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    interface Particle {
      x: number; y: number; vx: number; vy: number; r: number;
    }

    const particles: Particle[] = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.5 + 0.5,
    }));

    let alive = true;

    function draw() {
      if (!alive || !canvas || !ctx) return;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
      }

      // Draw edges
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(139,92,246,${(1 - dist / 120) * 0.18})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(139,92,246,0.35)';
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      alive = false;
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  );
}

// ── Ticker ───────────────────────────────────────────────────────────────────

const TICKER_ITEMS = [
  '12 Gadget Chains',
  '25 Research Labs',
  '6 Runtime Environments',
  'Real-Time OOB Simulation',
  'CWE-502 Coverage',
  'Python · Java · .NET',
];

function LiveTicker() {
  const [visible, setVisible] = useState<boolean[]>(Array(TICKER_ITEMS.length).fill(false));

  useEffect(() => {
    TICKER_ITEMS.forEach((_, i) => {
      setTimeout(() => {
        setVisible(v => { const n = [...v]; n[i] = true; return n; });
      }, 200 + i * 220);
    });
  }, []);

  return (
    <div className="flex items-center flex-wrap justify-center gap-3 mt-6">
      {TICKER_ITEMS.map((item, i) => (
        <span
          key={item}
          className={`text-xs font-mono text-serial-text-secondary px-2.5 py-1 rounded-full border border-serial-border bg-serial-surface/60 transition-all duration-500 ${visible[i] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

// ── Animated counter ─────────────────────────────────────────────────────────

function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const ran = useRef(false);

  const run = useCallback(() => {
    if (ran.current) return;
    ran.current = true;
    const start = Date.now();
    const dur = 1200;
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(e * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) run(); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [run]);

  return (
    <div ref={ref} className="text-4xl font-bold text-serial-text tabular-nums">
      {value}{suffix}
    </div>
  );
}

// ── Features ─────────────────────────────────────────────────────────────────

const FEATURES = [
  { title: 'Python Pickle', icon: <FlaskConical className="w-6 h-6" />, description: 'Analyze pickle protocol opcodes and __reduce__ chains', color: 'text-serial-violet', border: 'hover:border-serial-violet/40', href: '/dashboard/labs' },
  { title: 'Java Serialization', icon: <Link2 className="w-6 h-6" />, description: 'ObjectInputStream gadget chains and ClassLoader exploitation', color: 'text-serial-cyan', border: 'hover:border-serial-cyan/40', href: '/dashboard/labs' },
  { title: '.NET ViewState', icon: <Terminal className="w-6 h-6" />, description: 'BinaryFormatter gadgets and ViewState without MAC', color: 'text-serial-amber', border: 'hover:border-serial-amber/40', href: '/dashboard/labs' },
  { title: 'Gadget Chains', icon: <GitBranch className="w-6 h-6" />, description: 'Interactive chain explorer with node graph visualization', color: 'text-serial-violet', border: 'hover:border-serial-violet/40', href: '/dashboard/gadgets' },
  { title: 'ML Models', icon: <Brain className="w-6 h-6" />, description: 'PyTorch/sklearn pickle backends and model poisoning', color: 'text-serial-emerald', border: 'hover:border-serial-emerald/40', href: '/dashboard/labs' },
  { title: 'Scanner Lab', icon: <ScanLine className="w-6 h-6" />, description: 'Test against PickleScan, ModelScan, custom detectors', color: 'text-serial-cyan', border: 'hover:border-serial-cyan/40', href: '/dashboard/labs' },
  { title: 'Attack Simulator', icon: <GitFork className="w-6 h-6" />, description: 'Step-through full attack chain from payload to execution', color: 'text-serial-crimson', border: 'hover:border-serial-crimson/40', href: '/dashboard/attack-sim' },
  { title: 'Runtime Fingerprint', icon: <Fingerprint className="w-6 h-6" />, description: 'Identify dangerous library combinations', color: 'text-serial-crimson', border: 'hover:border-serial-crimson/40', href: '/dashboard/research' },
];

const STATS = [
  { value: 47, suffix: '', label: 'Known Gadget Classes' },
  { value: 9, suffix: '', label: 'CVEs Mapped' },
  { value: 6, suffix: '', label: 'Languages Covered' },
  { value: 25, suffix: '+', label: 'Research Labs' },
];

const NAV_LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Labs', href: '/dashboard/labs' },
  { label: 'Research', href: '/dashboard/research' },
  { label: 'Findings', href: '/dashboard/findings' },
  { label: 'Gadgets', href: '/dashboard/gadgets' },
];

// ── Main page ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const fade = (delay: number) => ({
    style: {
      opacity: loaded ? 1 : 0,
      transform: loaded ? 'translateY(0)' : 'translateY(16px)',
      transition: `opacity 0.55s ${delay}s, transform 0.55s ${delay}s`,
    },
  });

  return (
    <main className="min-h-screen bg-serial-bg">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Particle network */}
        <ParticleNetwork />

        {/* Background grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)`,
            backgroundSize: '52px 52px',
          }}
        />

        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-serial-violet/6 blur-[130px] pointer-events-none" />

        {/* Dehydration line — animated liquid evaporation effect */}
        <div className="absolute top-1/2 left-0 right-0 h-px overflow-hidden pointer-events-none" style={{ opacity: 0.08 }}>
          <div
            className="h-full bg-gradient-to-r from-transparent via-serial-cyan to-transparent"
            style={{ animation: 'evapLine 4s ease-in-out infinite' }}
          />
        </div>

        {/* Auth badge */}
        <div {...fade(0.1)}>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-serial-emerald/30 bg-serial-emerald/10 text-serial-emerald text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-serial-emerald animate-pulse" />
            AUTHORIZED RESEARCH LAB
          </div>
        </div>

        {/* Wordmark */}
        <h1
          className="text-7xl font-bold tracking-tight text-serial-text mt-8 select-none"
          style={{
            ...fade(0.2).style,
            textShadow: '0 0 60px rgba(139,92,246,0.4), 0 0 120px rgba(139,92,246,0.15)',
          }}
        >
          DEHYDRATE
        </h1>

        <p className="text-xs font-mono tracking-[0.25em] text-serial-text-secondary mt-3" {...fade(0.3)}>
          WHERE SERIALIZED OBJECTS ARE DISSECTED
        </p>

        <p className="text-sm text-serial-text-secondary max-w-lg text-center mt-6 leading-relaxed" {...fade(0.4)}>
          Analyze object reconstruction. Explore gadget chains. Understand where
          serialized data becomes executable behavior.
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-4 mt-10" {...fade(0.5)}>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-serial-violet text-white px-6 py-3 rounded-xl font-mono text-sm hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            ENTER RESEARCH LAB
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard/labs"
            className="border border-serial-border-light text-serial-text px-6 py-3 rounded-xl font-mono text-sm hover:bg-serial-surface hover:border-serial-violet/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            EXPLORE LABS
          </Link>
        </div>

        {/* Live ticker */}
        <div {...fade(0.65)}>
          <LiveTicker />
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 flex flex-col items-center gap-1" {...fade(1.2)}>
          <div className="w-px h-10 bg-gradient-to-b from-serial-border to-transparent" />
        </div>
      </section>

      {/* ── Attack Flow section ──────────────────────────────────────── */}
      <section className="px-6 py-20 border-t border-serial-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1 h-5 rounded-full bg-serial-violet" />
            <span className="text-xs font-mono text-serial-violet tracking-widest">ATTACK FLOW</span>
          </div>
          <h2 className="text-2xl font-bold text-serial-text mb-2">From Object to Exploit</h2>
          <p className="text-sm text-serial-text-muted mb-10 max-w-2xl">
            The complete deserialization attack lifecycle — from a benign-looking serialized blob to arbitrary code execution via gadget chain traversal.
          </p>
          <div className="bg-serial-surface border border-serial-border rounded-2xl p-8">
            <DehydrationFlow className="h-20" />
            <div className="mt-8 grid grid-cols-3 gap-6 text-xs font-mono">
              <div className="p-4 rounded-xl bg-serial-violet/5 border border-serial-violet/15">
                <div className="text-serial-violet mb-2 font-semibold">DEHYDRATION PHASE</div>
                <div className="text-serial-text-muted leading-relaxed">Legitimate application serializes in-memory objects to bytes for storage or transport. Data is compact, opaque, and trusted by the receiving application.</div>
              </div>
              <div className="p-4 rounded-xl bg-serial-amber/5 border border-serial-amber/15">
                <div className="text-serial-amber mb-2 font-semibold">TRANSMISSION PHASE</div>
                <div className="text-serial-text-muted leading-relaxed">Serialized bytes cross a trust boundary — HTTP body, cookie, queue message, file upload. Attacker substitutes their crafted payload for the legitimate one.</div>
              </div>
              <div className="p-4 rounded-xl bg-serial-crimson/5 border border-serial-crimson/15">
                <div className="text-serial-crimson mb-2 font-semibold">REHYDRATION EXPLOIT</div>
                <div className="text-serial-text-muted leading-relaxed">Deserializer blindly reconstructs the object graph. Gadget chain methods fire during object construction, achieving arbitrary OS code execution.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature grid ─────────────────────────────────────────────── */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1 h-5 rounded-full bg-serial-cyan" />
          <span className="text-xs font-mono text-serial-cyan tracking-widest">PLATFORM</span>
        </div>
        <h2 className="text-2xl font-bold text-serial-text mb-10">Research Capabilities</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <Link key={f.title} href={f.href} className="group block">
              <div className={`bg-serial-surface border border-serial-border rounded-2xl p-6 ${f.border} transition-all duration-200 cursor-pointer h-full hover:scale-[1.01] active:scale-[0.99]`}>
                <div className={`mb-4 ${f.color} group-hover:scale-110 transition-transform duration-200`}>
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-serial-text mb-2 font-mono">
                  {f.title}
                </h3>
                <p className="text-xs text-serial-text-muted leading-relaxed">
                  {f.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Stats section ─────────────────────────────────────────────── */}
      <section className="px-6 py-20 border-t border-b border-serial-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map(s => (
              <div key={s.label}>
                <AnimatedNumber target={s.value} suffix={s.suffix} />
                <div className="text-xs font-mono text-serial-text-muted mt-2 tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Understanding section ─────────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-serial-violet tracking-widest">CWE-502</span>
          </div>
          <h2 className="text-2xl font-bold text-serial-text mb-10">Understanding Insecure Deserialization</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4 text-sm text-serial-text-secondary leading-relaxed">
              <p>
                Serialization converts an in-memory object into a transportable byte
                sequence. Deserialization reconstructs that object — <em>rehydrating</em> it from
                compact bytes. When an application deserializes data from an untrusted source,
                it may reconstruct objects that trigger dangerous behavior without any
                additional code execution being visible to the caller.
              </p>
              <p>
                Attackers craft serialized payloads that reference specific object
                types — known as{' '}
                <span className="text-serial-violet font-mono">gadget chains</span> —
                which, when reconstructed, chain together to produce arbitrary code
                execution in the application context.
              </p>
              <p>
                CWE-502 (Deserialization of Untrusted Data) manifests across Python,
                Java, .NET, Ruby, PHP, and Node.js runtimes. OWASP A08:2021 covers
                this entire class of vulnerability.
              </p>
              <p>
                Machine learning pipelines face the same risk: PyTorch, scikit-learn,
                and most ML frameworks use pickle as the default serialization backend.
                A malicious model file executes arbitrary code on load.
              </p>
              <div className="pt-3 border-t border-serial-border">
                <p className="text-serial-text-muted text-xs font-mono">
                  References: OWASP A08:2021 · CWE-502 · Java CVE-2015-4852 · Python pickle docs · SafeTensors
                </p>
              </div>
            </div>

            <div className="bg-black/60 border border-serial-border rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-serial-border bg-serial-surface/50">
                <span className="w-2.5 h-2.5 rounded-full bg-serial-crimson/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-serial-amber/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-serial-emerald/70" />
                <span className="text-xs font-mono text-serial-text-muted ml-2 tracking-widest">EXAMPLE — ACADEMIC ONLY</span>
              </div>
              <pre className="p-4 text-xs font-mono text-serial-cyan leading-relaxed overflow-x-auto">
{`# CWE-502: Unsafe deserialization pattern
# (Academic illustration — not executable)

import pickle, os

class GadgetPayload:
    def __reduce__(self):
        # __reduce__ is called during deserialization.
        # Returns (callable, args) — pickle runs:
        #   callable(*args) to reconstruct the object.
        return (os.system, ('id',))

# ── Vulnerable deserialization point ──────
#
#   data = user_controlled_input
#   obj = pickle.loads(data)  # UNSAFE
#
# Gadget chain resolves as:
#   pickle.loads
#     → __reduce__
#       → os.system('id')
#         → arbitrary OS execution
#
# ── Safe alternatives ──────────────────────
#
#   • Replace pickle with json / msgpack / protobuf
#   • Implement RestrictedUnpickler with allowlist
#   • Use SafeTensors for ML model weights
#   • Validate HMAC before deserialization`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-serial-border">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-3">
              <SerialLogo size={24} />
              <p className="text-xs text-serial-text-muted leading-relaxed max-w-xs">
                Deserialization security research platform. Where serialized objects are dissected.
              </p>
              <p className="text-[10px] font-mono text-serial-text-muted/60">
                Built for security researchers. Lab environments only.
              </p>
            </div>

            {/* About */}
            <div>
              <div className="text-xs font-mono text-serial-text-secondary tracking-widest mb-4">ABOUT</div>
              <div className="space-y-2">
                {[
                  { label: 'Documentation', href: '/dashboard/docs' },
                  { label: 'CVE Database', href: '/dashboard/cves' },
                  { label: 'Settings', href: '/dashboard/settings' },
                ].map(l => (
                  <Link key={l.label} href={l.href} className="block text-xs text-serial-text-muted hover:text-serial-text-secondary transition-colors">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div>
              <div className="text-xs font-mono text-serial-text-secondary tracking-widest mb-4">PLATFORM</div>
              <div className="space-y-2">
                {[
                  { label: 'Dashboard', href: '/dashboard' },
                  { label: 'Research Lab', href: '/dashboard/research' },
                  { label: 'Gadget Chains', href: '/dashboard/gadgets' },
                  { label: 'Scanner Lab', href: '/dashboard/scanner' },
                ].map(l => (
                  <Link key={l.label} href={l.href} className="block text-xs text-serial-text-muted hover:text-serial-text-secondary transition-colors">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Research */}
            <div>
              <div className="text-xs font-mono text-serial-text-secondary tracking-widest mb-4">RESEARCH</div>
              <div className="space-y-2">
                {[
                  { label: 'Attack Simulator', href: '/dashboard/attack-sim' },
                  { label: 'Findings', href: '/dashboard/findings' },
                  { label: 'Reports', href: '/dashboard/reports' },
                  { label: 'Payload Lab', href: '/dashboard/payload' },
                ].map(l => (
                  <Link key={l.label} href={l.href} className="block text-xs text-serial-text-muted hover:text-serial-text-secondary transition-colors">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Social row */}
          <div className="flex items-center gap-4 mt-8 pt-6 border-t border-serial-border">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-serial-text-muted hover:text-serial-text transition-colors"
            >
              <Shield size={16} />
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-serial-border py-3 px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-serial-emerald animate-pulse" />
              <span className="text-[10px] font-mono text-serial-emerald tracking-widest">LAB MODE</span>
            </div>
            <span className="text-[10px] font-mono text-serial-text-muted/50 tracking-widest">
              AUTHORIZED ENVIRONMENTS ONLY
            </span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes evapLine {
          0%   { transform: translateX(-100%); opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
      `}</style>
    </main>
  );
}
