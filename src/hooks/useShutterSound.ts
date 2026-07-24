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

      // A mechanical shutter has two distinct sounds: Mirror Up (Ka) and Mirror Down (Chak)
      const createClick = (startTime: number, isDown: boolean) => {
        // 1. Mechanical snap (high frequency burst)
        const bufferSize = ctx.sampleRate * 0.025; // 25ms
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * (isDown ? 0.7 : 1.0);
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = isDown ? 3000 : 4500; // Lower pitch for mirror down
        noiseFilter.Q.value = 1.2;

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(2, startTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.025);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        // 2. Thump (body resonance)
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        
        const oscGain = ctx.createGain();
        osc.frequency.setValueAtTime(isDown ? 100 : 150, startTime);
        osc.frequency.exponentialRampToValueAtTime(40, startTime + 0.04);
        
        oscGain.gain.setValueAtTime(1.5, startTime);
        oscGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.04);
        
        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        
        noise.start(startTime);
        osc.start(startTime);
        noise.stop(startTime + 0.03);
        osc.stop(startTime + 0.05);
      };
      
      // Play mirror up (Ka)
      createClick(time, false);
      
      // Play mirror down (Chak) slightly after (simulating ~1/10s shutter speed)
      createClick(time + 0.1, true);

    } catch (e) {
      // Audio API not available or blocked — graceful degradation
    }
  }, []);

  return { playShutter };
}
