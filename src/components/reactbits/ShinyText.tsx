import { motion } from 'framer-motion';

export function ShinyText({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={`relative inline-block overflow-hidden ${className}`}>
      <span className="relative z-10">{text}</span>
      <motion.span 
        className="absolute inset-0 z-20 w-[150%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent mix-blend-overlay pointer-events-none"
        animate={{
          x: ['-100%', '150%'],
        }}
        transition={{
          repeat: Infinity,
          repeatType: 'loop',
          duration: 2.5,
          ease: 'linear',
          repeatDelay: 1
        }}
      />
    </span>
  );
}
