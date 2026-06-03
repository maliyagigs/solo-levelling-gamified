import React, { useEffect, useRef } from 'react';
import anime from 'animejs/lib/anime.es.js';

export const MonarchLogo: React.FC<{ size?: number }> = ({ size = 96 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.overflow = 'visible';
    
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <filter id="neon-cyan" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="blur1" />
        <feGaussianBlur stdDeviation="5" result="blur2" />
        <feMerge>
          <feMergeNode in="blur2" />
          <feMergeNode in="blur1" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="shadow-aura" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="blur1" />
        <feMerge>
          <feMergeNode in="blur1" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    `;
    svg.appendChild(defs);

    const createPath = (d: string, color: string, width: string, classes: string[], filterId?: string, fill?: string) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', fill || 'none');
      path.setAttribute('stroke', color);
      path.setAttribute('stroke-width', width);
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      if (filterId) {
        path.setAttribute('filter', `url(#${filterId})`);
      }
      classes.forEach(c => path.classList.add(c));
      svg.appendChild(path);
      return path;
    };

    // Background shadow aura (Tall ellipse / magical seal shape)
    createPath('M 100,0 C 180,20 190,160 100,210 C 10,160 20,20 100,0 Z', '#0f172a', '0', ['bg-aura'], 'shadow-aura', '#020617');

    // The Blade
    createPath('M 100,15 L 82,100 L 85,120 L 115,120 L 118,100 Z', '#e2e8f0', '2', ['blade-outer']);
    createPath('M 100,15 L 100,120', '#94a3b8', '2', ['blade-center']);
    // Internal blade hollows / blood grooves
    createPath('M 100,30 L 92,110', '#0ea5e9', '1', ['blade-energy'], 'neon-cyan');
    createPath('M 100,30 L 108,110', '#0ea5e9', '1', ['blade-energy'], 'neon-cyan');
    // Magical runes on blade
    createPath('M 100,45 L 94,52 L 100,55', '#38bdf8', '1.5', ['blade-rune'], 'neon-cyan');
    createPath('M 100,65 L 106,72 L 100,75 L 95,73', '#38bdf8', '1.5', ['blade-rune'], 'neon-cyan');
    createPath('M 100,85 L 94,92 L 100,95', '#38bdf8', '1.5', ['blade-rune'], 'neon-cyan');

    // Crossguard (sweeping demonic wings)
    createPath('M 40,100 C 60,80 85,115 85,125 C 75,135 45,125 40,100 Z', '#1e293b', '2', ['guard-path']);
    createPath('M 160,100 C 140,80 115,115 115,125 C 125,135 155,125 160,100 Z', '#1e293b', '2', ['guard-path']);
    createPath('M 60,105 Q 75,108 85,120', '#c084fc', '1.5', ['guard-accent'], 'neon-purple');
    createPath('M 140,105 Q 125,108 115,120', '#c084fc', '1.5', ['guard-accent'], 'neon-purple');

    // Core of Crossguard
    createPath('M 100,105 L 120,120 L 115,135 L 85,135 L 80,120 Z', '#0f172a', '2', ['guard-core']);
    // Embedded Gem
    createPath('M 100,110 L 112,122 L 100,130 L 88,122 Z', '#22d3ee', '1.5', ['gem-path'], 'neon-cyan', '#0891b2');

    // Grip
    createPath('M 90,135 L 90,175 L 110,175 L 110,135 Z', '#334155', '2', ['grip-path'], undefined, '#1e293b');
    
    // Leather Wraps on Grip
    for (let y = 135; y < 175; y += 8) {
      createPath(`M 90,${y} L 110,${y + 8}`, '#64748b', '1.5', ['grip-wrap']);
      createPath(`M 110,${y} L 90,${y + 8}`, '#64748b', '1.5', ['grip-wrap']);
    }

    // Pommel (sharp bottom)
    createPath('M 100,175 L 120,185 L 100,205 L 80,185 Z', '#1e293b', '2', ['pommel-path']);
    createPath('M 100,182 L 110,188 L 100,195 L 90,188 Z', '#22d3ee', '1.5', ['gem-path'], 'neon-cyan', '#0891b2');

    // Magic Wisps
    createPath('M 60,180 Q 20,120 70,70 T 90,10', '#a855f7', '1.5', ['wisp-path'], 'neon-purple');
    createPath('M 140,180 Q 180,120 130,70 T 110,10', '#a855f7', '1.5', ['wisp-path'], 'neon-purple');
    createPath('M 75,160 C 40,110 90,70 95,5', '#3b82f6', '2', ['wisp-path'], 'neon-cyan');
    createPath('M 125,160 C 160,110 110,70 105,5', '#3b82f6', '2', ['wisp-path'], 'neon-cyan');

    // Floating Particles
    createPath('M 30,130 L 30,120', '#22d3ee', '2.5', ['particle'], 'neon-cyan');
    createPath('M 170,120 L 170,110', '#c084fc', '2.5', ['particle'], 'neon-purple');
    createPath('M 50,70 L 50,60', '#c084fc', '2.5', ['particle'], 'neon-purple');
    createPath('M 150,60 L 150,50', '#22d3ee', '2.5', ['particle'], 'neon-cyan');
    createPath('M 70,30 L 70,20', '#22d3ee', '2.5', ['particle'], 'neon-cyan');
    createPath('M 130,40 L 130,30', '#c084fc', '2.5', ['particle'], 'neon-purple');

    containerRef.current.appendChild(svg);

    // Anime.js timelines
    
    // Structure draws in
    anime({
      targets: '.blade-outer, .blade-center, .guard-path, .guard-core, .pommel-path, .grip-path',
      strokeDashoffset: [anime.setDashoffset, 0],
      duration: 2500,
      easing: 'easeInOutCubic',
      delay: anime.stagger(150)
    });

    // Runes and internal energies pulse
    anime({
      targets: '.blade-energy, .blade-rune',
      strokeDashoffset: [anime.setDashoffset, 0],
      opacity: [0, 1],
      duration: 1500,
      delay: 1500,
      easing: 'easeOutElastic(1, .8)',
      loop: true,
      direction: 'alternate'
    });

    // Gems pulse
    anime({
      targets: '.gem-path',
      opacity: [1, 0.4, 1, 0.8, 1],
      scale: [0.95, 1.05, 1],
      duration: 2500,
      delay: 1500,
      easing: 'easeInOutQuad',
      loop: true,
      direction: 'alternate'
    });
    
    // Crossguard accent glow
    anime({
      targets: '.guard-accent',
      strokeDashoffset: [anime.setDashoffset, 0],
      opacity: [0, 1, 0.5],
      duration: 2000,
      delay: 1800,
      easing: 'easeInOutSine',
      loop: true,
      direction: 'alternate'
    });

    // Grip wraps bind
    anime({
      targets: '.grip-wrap',
      strokeDashoffset: [anime.setDashoffset, 0],
      duration: 1000,
      delay: anime.stagger(50, {start: 1000}),
      easing: 'easeOutQuad'
    });

    // Wisp flames rising
    anime({
      targets: '.wisp-path',
      strokeDashoffset: [anime.setDashoffset, 0],
      opacity: [0, 0.8, 0],
      translateY: [20, -20],
      duration: 3000,
      easing: 'linear',
      loop: true,
      delay: anime.stagger(250)
    });

    // Particles drifting
    anime({
      targets: '.particle',
      strokeDashoffset: [anime.setDashoffset, 0],
      opacity: [0, 1, 0],
      translateY: [10, -40],
      translateX: () => anime.random(-10, 10),
      duration: 2500,
      easing: 'linear',
      loop: true,
      delay: anime.stagger(300)
    });

    // Subtle breathing/floating effect on the whole aura
    anime({
      targets: '.bg-aura',
      scale: [0.97, 1.03],
      opacity: [0.7, 1],
      duration: 4000,
      easing: 'easeInOutSine',
      loop: true,
      direction: 'alternate'
    });

    return () => {
      anime.remove('.blade-outer, .blade-center, .guard-path, .guard-core, .pommel-path, .grip-path, .blade-energy, .blade-rune, .gem-path, .guard-accent, .grip-wrap, .wisp-path, .particle, .bg-aura');
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative z-10 flex items-center justify-center transform hover:scale-105 transition-transform duration-700"
      style={{ width: size, height: size }}
    />
  );
};
