import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface TiltedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  altText?: string;
}

export function TiltedCard({ children, className = '', onClick, altText }: TiltedCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth out the mouse movement for tilt
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  // Map mouse position to rotation (tilt)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg']);
  
  // Calculate a slight shadow movement opposite to the tilt
  const shadowX = useTransform(mouseXSpring, [-0.5, 0.5], ['15px', '-15px']);
  const shadowY = useTransform(mouseYSpring, [-0.5, 0.5], ['15px', '-15px']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={`relative cursor-pointer transition-zIndex will-change-transform z-10 hover:z-50 ${className}`}
      aria-label={altText}
    >
      {/* 3D Inner Content */}
      <div 
        style={{ transform: 'translateZ(30px)' }} 
        className="w-full h-full relative"
      >
        {children}
      </div>
      
      {/* Dynamic 3D Drop Shadow */}
      <motion.div 
        className="absolute inset-0 bg-black/40 blur-xl z-[-1]"
        style={{ 
          transform: 'translateZ(-20px)',
          x: shadowX,
          y: shadowY
        }}
      />
    </motion.div>
  );
}
