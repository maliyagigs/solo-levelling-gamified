import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerRef = useRef<any>(null);
  const [iframeStyle, setIframeStyle] = useState<React.CSSProperties>({
    width: "100%",
    height: "100%",
  });

  useEffect(() => {
    const updateSize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const videoRatio = 9 / 16; // portrait YouTube short aspect ratio (9:16)
      const screenRatio = w / h;

      if (screenRatio > videoRatio) {
        // Screen is wider than portrait video aspect ratio
        setIframeStyle({
          width: "100vw",
          height: `${100 / videoRatio}vw`,
          minHeight: "100vh",
        });
      } else {
        // Screen is taller than portrait video aspect ratio
        setIframeStyle({
          width: `${100 * videoRatio}vh`,
          height: "100vh",
          minWidth: "100vw",
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Initialize YouTube Iframe Player API for seamless loop integration
  useEffect(() => {
    let checkInterval: any;
    let loopInterval: any;

    const initPlayer = () => {
      if (playerRef.current) return;

      try {
        playerRef.current = new window.YT.Player("yt-player-bg", {
          videoId: "HUJb3DjLcOo",
          playerVars: {
            autoplay: 1,
            mute: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            iv_load_policy: 3,
            rel: 0,
            playsinline: 1,
            showinfo: 0,
            loop: 1,
            playlist: "HUJb3DjLcOo",
          },
          events: {
            onReady: (event: any) => {
              event.target.playVideo();
              event.target.mute();
            },
            onStateChange: (event: any) => {
              // Robust fallback loop back to start if it somehow hits ENDED state
              if (event.data === window.YT.PlayerState.ENDED) {
                event.target.seekTo(0);
                event.target.playVideo();
              }
            },
          },
        });

        // Fast interval to loop early (approx. 0.6s before original duration end)
        // This avoids YouTube showing black screen reload spinner, controls or recommendations overlay
        loopInterval = setInterval(() => {
          const player = playerRef.current;
          if (
            player &&
            typeof player.getCurrentTime === "function" &&
            typeof player.getDuration === "function"
          ) {
            try {
              const currentTime = player.getCurrentTime();
              const duration = player.getDuration();
              if (duration > 0 && currentTime >= duration - 0.6) {
                player.seekTo(0, true);
              }
            } catch (e) {
              // Ignore occasional player tick warnings before fully initialized
            }
          }
        }, 120);

      } catch (err) {
        console.error("YouTube Player init error:", err);
      }
    };

    if (!window.YT) {
      // Injects the YouTube iframe API script dynamically
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        if (firstScriptTag && firstScriptTag.parentNode) {
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
          document.head.appendChild(tag);
        }
      }

      // Hook up globally defined onYouTubeIframeAPIReady callback
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (previousCallback) previousCallback();
        initPlayer();
      };

      // Interval fallback check to catch API loaded status
      checkInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkInterval);
          initPlayer();
        }
      }, 500);
    } else {
      initPlayer();
    }

    return () => {
      clearInterval(checkInterval);
      clearInterval(loopInterval);
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        try {
          playerRef.current.destroy();
        } catch (e) {}
        playerRef.current = null;
      }
    };
  }, []);

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

    const particles: Particle[] = [];
    const particleCount = Math.min(65, Math.floor((width * height) / 25000));

    const colors = [
      "rgba(6, 182, 212, ",   // Cyan
      "rgba(99, 102, 241, ",  // Indigo
      "rgba(139, 92, 246, ",  // Violet
      "rgba(236, 72, 153, ",  // Pink / Fuchsia
    ];

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
        ctx.shadowBlur = p.baseRadius > 1.2 ? 10 : 0;
        ctx.shadowColor = p.baseRadius > 1.2 ? `${p.color}0.5)` : "transparent";
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      // Draw elegant constellation connectors between closest nodes
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

      {/* 2. Embedded Video player with absolute robust fallback source checks */}
      <div
        style={{
          ...iframeStyle,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) scale(1.15)", // zoom in 1.15x to crop YouTube's built-in header UI for clean, pure loop
          pointerEvents: "none",
        }}
        className="absolute z-10 opacity-55 transition-opacity duration-1000"
      >
        <div id="yt-player-bg" className="w-full h-full" />
      </div>

      {/* 3. HTML5 Dynamic Interactive Canvas Universe layer */}
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
