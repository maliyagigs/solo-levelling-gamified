import React, { useEffect, useRef } from "react";

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track mouse coordinates for interactive parallax drift
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX - window.innerWidth / 2) * 0.05;
      targetMouseY = (e.clientY - window.innerHeight / 2) * 0.05;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Particle class representing celestial dust
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      baseRadius: number;
      color: string;
      alpha: number;
      alphaSpeed: number;
      pulseDirection: number;
    }

    const isMobile = window.innerWidth < 768;
    const isLowEnd = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false;
    const simplifyGraphics = isMobile || isLowEnd;

    const particles: Particle[] = [];
    // Drastically reduce particle count for performance on low-end devices
    const particleRatio = simplifyGraphics ? 40000 : 20000;
    const maxParticles = simplifyGraphics ? 25 : 80;
    const particleCount = Math.min(maxParticles, Math.floor((width * height) / particleRatio));

    const colors = [
      "rgba(6, 182, 212, ",   // Cyan
      "rgba(99, 102, 241, ",  // Indigo
      "rgba(139, 92, 246, ",  // Violet
      "rgba(236, 72, 153, ",  // Pink / Fuchsia
      "rgba(168, 85, 247, ",  // Purple
    ];

    // Shooting stars
    interface ShootingStar {
      x: number;
      y: number;
      vx: number;
      vy: number;
      length: number;
      alpha: number;
      speed: number;
      active: boolean;
    }
    const shootingStars: ShootingStar[] = [];
    for (let i = 0; i < 3; i++) {
      shootingStars.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.5,
        vx: Math.random() * 4 + 4,
        vy: Math.random() * 2 + 2,
        length: Math.random() * 80 + 40,
        alpha: 0,
        speed: Math.random() * 0.02 + 0.01,
        active: Math.random() > 0.5,
      });
    }

    for (let i = 0; i < particleCount; i++) {
      const baseRadius = Math.random() * 1.8 + 0.5;
      const colorPrefix = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: baseRadius,
        baseRadius,
        color: colorPrefix,
        alpha: Math.random() * 0.6 + 0.2,
        alphaSpeed: Math.random() * 0.005 + 0.002,
        pulseDirection: Math.random() > 0.5 ? 1 : -1,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Render loop
    const render = () => {
      // Soft drift for mouse coordinates (lerp)
      mouseX += (targetMouseX - mouseX) * 0.08;
      mouseY += (targetMouseY - mouseY) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // Draw faint background glows manually in the canvas
      // Center nebula
      const radGrad = ctx.createRadialGradient(
         width / 2 + mouseX * 0.5,
         height / 2 + mouseY * 0.5,
         10,
         width / 2 + mouseX,
         height / 2 + mouseY,
         Math.max(width, height) * 0.6
      );
      radGrad.addColorStop(0, "rgba(23, 14, 53, 0.12)"); // deep purple star-core
      radGrad.addColorStop(0.5, "rgba(8, 47, 73, 0.08)"); // cyan space dust
      radGrad.addColorStop(1, "rgba(2, 6, 23, 0)");
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, width, height);

      // Render star particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Animate alpha pulse
        p.alpha += p.alphaSpeed * p.pulseDirection;
        if (p.alpha >= 0.8) {
          p.alpha = 0.8;
          p.pulseDirection = -1;
        } else if (p.alpha <= 0.15) {
          p.alpha = 0.15;
          p.pulseDirection = 1;
        }

        // Apply velocities + interactive mouse parallax drift
        const dx = p.vx + mouseX * 0.02 * (p.baseRadius * 0.3);
        const dy = p.vy + mouseY * 0.02 * (p.baseRadius * 0.3);

        p.x += dx;
        p.y += dy;

        // Wrap around screen boundaries with safety padding
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Draw particle glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        if (!simplifyGraphics) {
          ctx.shadowBlur = p.baseRadius > 1.2 ? 10 : 0;
          ctx.shadowColor = p.baseRadius > 1.2 ? `${p.color}0.5)` : "transparent";
        }
        ctx.fill();
        if (!simplifyGraphics) {
          ctx.shadowBlur = 0; // reset
        }
      }

      // Render shooting stars
      for (let i = 0; i < shootingStars.length; i++) {
        const s = shootingStars[i];
        if (s.active) {
          s.x += s.vx;
          s.y += s.vy;
          s.alpha += s.speed;

          if (s.alpha > 0.8) {
            s.speed = -Math.abs(s.speed);
          }

          if (s.alpha <= 0 || s.x > width || s.y > height) {
            // Reset shooting star with new coords
            s.x = Math.random() * width * 0.5;
            s.y = Math.random() * height * 0.4;
            s.alpha = 0;
            s.speed = Math.abs(s.speed);
            s.active = Math.random() > 0.4;
          }

          if (s.alpha > 0) {
            const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.length, s.y - s.length);
            grad.addColorStop(0, `rgba(168, 85, 247, ${s.alpha})`);
            grad.addColorStop(0.5, `rgba(99, 102, 241, ${s.alpha * 0.5})`);
            grad.addColorStop(1, `rgba(6, 182, 212, 0)`);
            ctx.beginPath();
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s.x - s.length, s.y - s.length);
            ctx.stroke();
          }
        } else {
          // Bring it to active state randomly
          if (Math.random() < 0.005) {
            s.active = true;
          }
        }
      }

      // Draw elegant constellation connectors between closest nodes
      if (!simplifyGraphics) {
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const pi = particles[i];
            const pj = particles[j];

            const distSquare = Math.pow(pi.x - pj.x, 2) + Math.pow(pi.y - pj.y, 2);
            const maxDistance = 140;

            if (distSquare < maxDistance * maxDistance) {
              const dist = Math.sqrt(distSquare);
              const force = (maxDistance - dist) / maxDistance;
              const alphaVal = force * 0.12 * (pi.alpha + pj.alpha) * 0.5;

              ctx.beginPath();
              ctx.moveTo(pi.x, pi.y);
              ctx.lineTo(pj.x, pj.y);
              
              // Draw dual tone connection vectors
              ctx.strokeStyle = `rgba(99, 102, 241, ${alphaVal})`;
              ctx.stroke();
            }
          }
        }
      }

      // Draw subtle orbital rings or system vectors in the center background
      ctx.beginPath();
      ctx.arc(width / 2 + mouseX * 0.3, height / 2 + mouseY * 0.3, 180, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(6, 182, 212, 0.015)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(width / 2 + mouseX * 0.3, height / 2 + mouseY * 0.3, 300, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(139, 92, 246, 0.008)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 15]);
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden select-none bg-[#020617]">
      {/* 1. Underlying Deep Nebula Base Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.65)_0%,rgba(2,6,23,0.98)_100%)] z-0" />

      {/* 2. HTML5 Dynamic Interactive Canvas Universe layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-20 pointer-events-none"
      />

      {/* 4. Fine Matrix Dark Vignette Cover to boost readability and high contrast */}
      <div 
        className="absolute inset-0 bg-transparent z-30" 
        style={{
          background: "radial-gradient(circle at center, rgba(2,6,23,0) 0%, rgba(2,6,23,0.7) 100%)",
        }}
      />
    </div>
  );
}
