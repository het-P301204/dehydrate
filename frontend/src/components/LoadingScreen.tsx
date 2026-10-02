'use client';

import React, { useEffect, useState } from 'react';
import { SerialLogo } from './SerialLogo';

const MESSAGES = [
  'INITIALIZING DEHYDRATE',
  'LOADING RESEARCH ENVIRONMENT',
  'LAB READY',
];

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [phase, setPhase] = useState(0);
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setPhase(1), 400));
    timers.push(setTimeout(() => setPhase(2), 1000));
    timers.push(setTimeout(() => setProgress(100), 1200));
    timers.push(setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 400);
    }, 2000));

    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 8, 95));
    }, 60);
    timers.push(setTimeout(() => clearInterval(progressInterval), 1200));

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-serial-bg transition-opacity duration-400 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Logo animation */}
      <div
        className={`transition-all duration-700 ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <SerialLogo size={48} showText={false} />
      </div>

      {/* Title */}
      <div
        className={`mt-6 font-mono font-bold text-2xl tracking-[0.3em] text-serial-text transition-all duration-700 delay-200 ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
      >
        DEHYDRATE
      </div>

      {/* Progress */}
      <div className="mt-8 w-64 space-y-3">
        <div className="h-px bg-serial-surface3 rounded-full overflow-hidden">
          <div
            className="h-full bg-serial-violet rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div
          className={`text-center text-xs font-mono text-serial-text-muted tracking-widest transition-all duration-500 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}
        >
          {MESSAGES[Math.min(phase, MESSAGES.length - 1)]}
        </div>
      </div>
    </div>
  );
}
