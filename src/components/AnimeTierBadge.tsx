import React, { useEffect, useRef } from 'react';
import anime from 'animejs/lib/anime.es.js';

interface AnimeTierBadgeProps {
  color: string;
  glow: string;
  size?: number;
}

export const AnimeTierBadge: React.FC<AnimeTierBadgeProps> = ({ color, glow, size = 160 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const wrapper = containerRef.current;
    wrapper.innerHTML = '';
    wrapper.style.overflow = 'hidden';
    
    // Mask to constrain the matrix to a sphere fading out perfectly at edges
    wrapper.style.maskImage = 'radial-gradient(circle at center, black 40%, transparent 85%)';
    wrapper.style.WebkitMaskImage = 'radial-gradient(circle at center, black 40%, transparent 85%)';

    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレゲゼデベペオォコソトノホモヨョロゴゾドボポヴッン0123456789';

    const numCols = 16;
    const colElements: HTMLDivElement[] = [];

    // MATRIX RAIN LAYER
    const matrixContainer = document.createElement('div');
    matrixContainer.className = 'absolute inset-0';
    wrapper.appendChild(matrixContainer);

    for (let i = 0; i < numCols; i++) {
        const col = document.createElement('div');
        col.style.position = 'absolute';
        col.style.left = `${(i / numCols) * 100}%`;
        col.style.top = '-100%';
        col.style.width = `${100 / numCols}%`;
        col.style.color = color;
        col.style.textShadow = `0 0 5px ${glow}`;
        col.style.fontFamily = 'monospace';
        col.style.fontSize = '10px'; // Small tight font
        col.style.textAlign = 'center';
        col.style.fontWeight = 'bold';
        col.style.lineHeight = '1.1';
        col.classList.add('matrix-col');

        const len = Math.floor(Math.random() * 10) + 12;
        for (let j = 0; j < len; j++) {
            const charDiv = document.createElement('div');
            charDiv.innerText = katakana[Math.floor(Math.random() * katakana.length)];
            const isHead = j === len - 1;
            charDiv.style.opacity = isHead ? '1' : `${j / len}`;
            charDiv.style.color = isHead ? '#ffffff' : color;
            charDiv.style.textShadow = isHead ? `0 0 8px #ffffff, 0 0 15px ${glow}` : `0 0 5px ${glow}`;
            if (isHead) charDiv.style.transform = 'scale(1.3)';
            col.appendChild(charDiv);
        }

        matrixContainer.appendChild(col);
        colElements.push(col);

        anime({
            targets: col,
            translateY: ['0%', '300%'],
            duration: anime.random(2000, 6000),
            easing: 'linear',
            loop: true,
            delay: anime.random(0, 3000),
        });
    }

    // GLITCHING SYSTEM DATA OVERLAY
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.style.position = 'absolute';
    svg.style.inset = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    wrapper.appendChild(svg);

    const createPath = (d: string, stroke: string, width: string, classes: string[], dash?: string) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', stroke);
        path.setAttribute('stroke-width', width);
        if (dash) path.setAttribute('stroke-dasharray', dash);
        classes.forEach(c => path.classList.add(c));
        path.style.filter = `drop-shadow(0 0 4px ${glow})`;
        svg.appendChild(path);
    };

    // System Tech Rings
    createPath('M 100,10 A 90,90 0 1,0 100,190 A 90,90 0 1,0 100,10', color, '1', ['sys-ring-1'], '4 12');
    createPath('M 100,30 A 70,70 0 1,0 100,170 A 70,70 0 1,0 100,30', color, '0.5', ['sys-ring-2'], '20 10 5 10');
    createPath('M 100,45 A 55,55 0 1,0 100,155 A 55,55 0 1,0 100,45', color, '1.5', ['sys-ring-3'], '2 8');

    // Central crosshair/targeting
    createPath('M 100,15 L 100,35 M 100,165 L 100,185 M 15,100 L 35,100 M 165,100 L 185,100', color, '1', ['sys-crosshair']);

    // Animate Rings
    anime({
        targets: '.sys-ring-1',
        rotateZ: [0, 360],
        duration: 20000,
        easing: 'linear',
        loop: true,
        transformOrigin: '100px 100px',
    });
    anime({
        targets: '.sys-ring-2',
        rotateZ: [360, 0],
        duration: 15000,
        easing: 'linear',
        loop: true,
        transformOrigin: '100px 100px',
    });
    anime({
        targets: '.sys-ring-3',
        rotateZ: [0, 360],
        duration: 8000,
        easing: 'linear',
        loop: true,
        transformOrigin: '100px 100px',
    });
    
    // Scale pulse for the crosshair
    anime({
        targets: '.sys-crosshair',
        scale: [0.96, 1.04],
        opacity: [0.3, 1],
        duration: 1500,
        easing: 'easeInOutSine',
        loop: true,
        direction: 'alternate',
        transformOrigin: '100px 100px',
    });

    // Matrix glitch code scramble interval
    const interval = setInterval(() => {
        // Randomly scramble a few characters 
        for (let i = 0; i < 3; i++) {
            const randomCol = colElements[Math.floor(Math.random() * colElements.length)];
            if (randomCol && randomCol.children.length > 0) {
                const randomIndex = Math.floor(Math.random() * randomCol.children.length);
                const charEl = randomCol.children[randomIndex] as HTMLDivElement;
                charEl.innerText = katakana[Math.floor(Math.random() * katakana.length)];
            }
        }
    }, 40);

    return () => {
        anime.remove('.matrix-col');
        anime.remove('.sys-ring-1, .sys-ring-2, .sys-ring-3, .sys-crosshair');
        clearInterval(interval);
    };
  }, [color, glow]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 z-0 flex items-center justify-center opacity-90 mix-blend-screen"
    />
  );
};
