import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface FlameParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  edge: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * FlameParticles - emanating from KING card edges.
 * Lightweight: uses 12-16 particles with staggered CSS animation.
 */
export function FlameParticles({ particleCount = 14 }: { particleCount?: number }) {
  const particles = useMemo<FlameParticle[]>(() => {
    return Array.from({ length: particleCount }, (_, i) => {
      const edge = (['top', 'bottom', 'left', 'right'] as const)[i % 4];
      let x = 0,
        y = 0;

      switch (edge) {
        case 'top':
          x = Math.random() * 100;
          y = 0;
          break;
        case 'bottom':
          x = Math.random() * 100;
          y = 100;
          break;
        case 'left':
          x = 0;
          y = Math.random() * 100;
          break;
        case 'right':
          x = 100;
          y = Math.random() * 100;
          break;
      }

      return {
        id: i,
        x,
        y,
        size: 2 + Math.random() * 4,
        duration: 0.8 + Math.random() * 1.2,
        delay: Math.random() * 2,
        edge,
      };
    });
  }, [particleCount]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
      {particles.map((p) => {
        const yOffset = p.edge === 'bottom' ? 20 : -20;
        const xOffset = p.edge === 'right' ? 20 : p.edge === 'left' ? -20 : 0;

        return (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: `radial-gradient(circle, #ff4d00 0%, #ff8c00 50%, transparent 100%)`,
            }}
            animate={{
              y: [0, yOffset, yOffset * 2],
              x: [0, xOffset * 0.5, xOffset],
              opacity: [0.8, 1, 0],
              scale: [1, 1.5, 0.5],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        );
      })}
    </div>
  );
}
