import { useCallback, useRef } from 'react';

export function useShutterSound(): { playShutter: () => void } {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playShutter = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return; // Audio not supported
        audioCtxRef.current = new AudioContextClass();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const time = ctx.currentTime;

      // 1. High-frequency click (mechanical noise)
      const bufferSize = ctx.sampleRate * 0.04; // 40ms noise
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 2000;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.8, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.04);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      // 2. Low-frequency thump (mirror slap)
      const osc = ctx.createOscillator();
      osc.type = 'square';
      
      const oscGain = ctx.createGain();
      osc.frequency.setValueAtTime(150, time);
      osc.frequency.exponentialRampToValueAtTime(40, time + 0.08);
      
      oscGain.gain.setValueAtTime(1, time);
      oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      // Start sounds
      noise.start(time);
      osc.start(time);
      
      noise.stop(time + 0.04);
      osc.stop(time + 0.08);

    } catch (e) {
      // Audio API not available or blocked — graceful degradation
    }
  }, []);

  return { playShutter };
}
