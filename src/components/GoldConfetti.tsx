import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  angle: number;
  rot: number;
  rotSpeed: number;
  opacity: number;
  hue: number;
};

const GOLDS = [
  "255, 215, 130",
  "230, 190, 100",
  "255, 234, 170",
  "212, 175, 55",
];

export default function GoldConfetti() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: Particle[] = [];
    let raf = 0;
    let running = true;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const COUNT = isMobile ? 26 : 55;

    const spawn = (initial = false): Particle => {
      const size = 2 + Math.random() * 5;
      return {
        x: Math.random() * width,
        y: initial ? Math.random() * height : -10 - Math.random() * height * 0.5,
        size,
        speed: 0.25 + Math.random() * 0.9,
        drift: (Math.random() - 0.5) * 0.4,
        angle: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        opacity: 0.35 + Math.random() * 0.55,
        hue: Math.floor(Math.random() * GOLDS.length),
      };
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (particles.length === 0) {
        particles = Array.from({ length: COUNT }, () => spawn(true));
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const onVisibility = () => {
      running = !document.hidden;
      if (running) raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVisibility);

    const loop = () => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.angle += 0.01;
        p.y += p.speed;
        p.x += p.drift + Math.sin(p.angle) * 0.3;
        p.rot += p.rotSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        const grad = ctx.createLinearGradient(-p.size, 0, p.size, 0);
        grad.addColorStop(0, `rgba(${GOLDS[p.hue]}, ${p.opacity * 0.3})`);
        grad.addColorStop(0.5, `rgba(${GOLDS[p.hue]}, ${p.opacity})`);
        grad.addColorStop(1, `rgba(${GOLDS[p.hue]}, ${p.opacity * 0.3})`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (p.y > height + 20) {
          Object.assign(p, spawn(false));
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100]"
    />
  );
}
