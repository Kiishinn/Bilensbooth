import { motion } from 'framer-motion';

export function GlobalBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-paper-base">
      {/* Animated Subtle Gradient */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.8)_0%,rgba(244,244,245,0)_70%)] opacity-40 mix-blend-overlay"
      />
      
      {/* Minimal Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #1b1c1c 1px, transparent 1px),
            linear-gradient(to bottom, #1b1c1c 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)'
        }}
      />
      
      {/* Fuzzy Noise Overlay */}
      <motion.div
        initial={{ transform: 'translateX(-10%) translateY(-10%)' }}
        animate={{
          transform: 'translateX(10%) translateY(10%)',
        }}
        transition={{
          repeat: Infinity,
          duration: 0.2,
          ease: 'linear',
          repeatType: 'mirror',
        }}
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
        }}
        className="absolute -inset-[100%] opacity-[0.04]"
      />
    </div>
  );
}
