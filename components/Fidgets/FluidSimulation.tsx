'use client';
import { useRef, useEffect, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  baseX: number; // original grid position
  baseY: number;
  baseSize: number; // base size
  currentSize: number; // current animated size
  wavePhase: number; // for wave animation
  sizeMultiplier: number; // for mouse-induced size changes
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  strength: number;
  life: number;
}

export default function FluidSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const isDraggingRef = useRef(false);
  const mouseRef = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const lastRippleRef = useRef({ x: 0, y: 0, time: 0 });
  const settingsRef = useRef({
    particleCount: 1000,
    waveStrength: 0.7,
    waveSpeed: 0.02,
    mouseInfluence: 80,
    density: 0.5
  });

  const [settings, setSettings] = useState({
    particleCount: 1000,
    waveStrength: 0.7,
    waveSpeed: 0.02,
    mouseInfluence: 80,
    density: 0.5
  });

  // Update settings ref whenever settings change (without restarting animation)
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const initParticles = (canvas: HTMLCanvasElement, count: number) => {
    // Create a dense grid of particles
    const aspectRatio = canvas.width / canvas.height;
    const cols = Math.ceil(Math.sqrt(count * aspectRatio));
    const rows = Math.ceil(count / cols);
    const spacingX = canvas.width / (cols - 1);
    const spacingY = canvas.height / (rows - 1);

    const particles: Particle[] = [];
    let particleIndex = 0;

    for (let row = 0; row < rows && particleIndex < count; row++) {
      for (let col = 0; col < cols && particleIndex < count; col++) {
        const baseX = col * spacingX;
        const baseY = row * spacingY;
        const baseSize = 2 + Math.random() * 2;

        particles.push({
          x: baseX,
          y: baseY,
          baseX,
          baseY,
          baseSize,
          currentSize: baseSize,
          wavePhase: Math.random() * Math.PI * 2,
          sizeMultiplier: 1.0
        });
        particleIndex++;
      }
    }

    particlesRef.current = particles;
  };

  const createRipple = (x: number, y: number, strength: number = 2) => {
    ripplesRef.current.push({
      x,
      y,
      radius: 0,
      maxRadius: 300,
      strength,
      life: 1.5 // Longer lasting ripples
    });
  };  // Only reinit particles when count changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      initParticles(canvas, settings.particleCount);
    }
  }, [settings.particleCount]);

  const updateParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const currentSettings = settingsRef.current;
    const particles = particlesRef.current;
    const ripples = ripplesRef.current;

    // Update ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const ripple = ripples[i];
      ripple.radius += 2.5; // Slightly slower expansion
      ripple.life -= 0.008; // Much slower decay for longer lasting ripples

      if (ripple.life <= 0 || ripple.radius > ripple.maxRadius) {
        ripples.splice(i, 1);
      }
    } for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Update wave phase for continuous wave animation
      p.wavePhase += currentSettings.waveSpeed;

      // Check if particle is near mouse (disable waves if dragging nearby)
      let nearMouse = false;
      let mouseInfluence = 1.0;

      if (isDraggingRef.current) {
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const influenceRadius = currentSettings.mouseInfluence;

        if (distance < influenceRadius) {
          nearMouse = true;
          const influence = 1 - (distance / influenceRadius);
          // Max size when dragging near mouse
          mouseInfluence = 1 + influence * 4; // Much larger multiplier
        }
      }

      // Check ripple effects
      let rippleInfluence = 1.0;
      for (const ripple of ripples) {
        const dx = p.x - ripple.x;
        const dy = p.y - ripple.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const rippleEdge = Math.abs(distance - ripple.radius);

        if (rippleEdge < 30) { // Ripple effect width
          const rippleStrength = (1 - rippleEdge / 30) * ripple.strength * ripple.life;
          rippleInfluence = Math.max(rippleInfluence, 1 + rippleStrength);
        }
      }

      // Calculate wave-based size multiplier (only if not near mouse)
      let waveSize = 1.0;
      if (!nearMouse) {
        waveSize = 1 + Math.sin(p.wavePhase + p.baseX * 0.01 + p.baseY * 0.008) * currentSettings.waveStrength;
      }

      // Smooth transition of size multiplier for ripple effects
      const targetMultiplier = Math.max(mouseInfluence, rippleInfluence);
      p.sizeMultiplier += (targetMultiplier - p.sizeMultiplier) * 0.15;

      // Calculate final size with minimum to prevent negative values
      p.currentSize = Math.max(0.1, p.baseSize * waveSize * p.sizeMultiplier * currentSettings.density);

      // Ensure particles stay in their grid positions
      p.x = p.baseX;
      p.y = p.baseY;
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear with slight trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw particles with solid colors that change based on size
    ctx.globalCompositeOperation = 'source-over';

    // Detect dark mode
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)';

    particlesRef.current.forEach((p: Particle) => {
      const size = Math.max(0.1, p.currentSize); // Ensure positive size

      // Color changes based on size - small = blue, medium = cyan, large = purple
      let hue, sat, light;
      if (size < 3) {
        // Small particles - blue
        hue = 220;
        sat = 80;
        light = 60;
      } else if (size < 6) {
        // Medium particles - cyan
        hue = 180;
        sat = 70;
        light = 65;
      } else {
        // Large particles - purple/magenta
        hue = 280;
        sat = 75;
        light = 70;
      }

      // No transparency - solid colors only
      ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fill();

      // Add thin border
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });
    ctx.globalCompositeOperation = 'source-over';
  };

  const animate = () => {
    updateParticles();
    draw();
    animationRef.current = requestAnimationFrame(animate);
  };

  // Initialize animation loop only once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initParticles(canvas, settingsRef.current.particleCount);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        px: mouseRef.current.x,
        py: mouseRef.current.y,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      // Create trailing ripples while dragging (like finger through water)
      if (isDraggingRef.current) {
        const now = performance.now();
        const dx = mouseRef.current.x - lastRippleRef.current.x;
        const dy = mouseRef.current.y - lastRippleRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Create ripples every 20 pixels moved or every 150ms
        if ((distance > 20 || now - lastRippleRef.current.time > 150) && distance > 5) {
          createRipple(mouseRef.current.x, mouseRef.current.y, 1.5);
          lastRippleRef.current = {
            x: mouseRef.current.x,
            y: mouseRef.current.y,
            time: now
          };
        }
      }
    };

    const handleMouseDown = () => {
      isDraggingRef.current = true;
      // Create ripple on mouse down
      createRipple(mouseRef.current.x, mouseRef.current.y, 3);
      // Initialize ripple tracking
      lastRippleRef.current = {
        x: mouseRef.current.x,
        y: mouseRef.current.y,
        time: performance.now()
      };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      // Create ripple on mouse up
      createRipple(mouseRef.current.x, mouseRef.current.y, 2);
    };

    // Initialize canvas and particles
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    // Start animation loop
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      cancelAnimationFrame(animationRef.current);
    };
  }, []); // Empty dependency array - run only once

  return (
    <div className="w-full h-full min-h-[400px] bg-card rounded-2xl border p-4">
      <div className="mb-4 space-y-3">
        <h3 className="text-lg font-semibold">Fluid Simulation</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block text-muted-foreground mb-1">Particles: {settings.particleCount}</label>
            <input
              type="range"
              min="100"
              max="2000"
              value={settings.particleCount}
              onChange={(e) => setSettings(s => ({ ...s, particleCount: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-muted-foreground mb-1">Density: {settings.density.toFixed(1)}</label>
            <input
              type="range"
              min="0.3"
              max="2.0"
              step="0.1"
              value={settings.density}
              onChange={(e) => setSettings(s => ({ ...s, density: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-muted-foreground mb-1">Wave Strength: {settings.waveStrength.toFixed(1)}</label>
            <input
              type="range"
              min="0"
              max="2.0"
              step="0.1"
              value={settings.waveStrength}
              onChange={(e) => setSettings(s => ({ ...s, waveStrength: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-muted-foreground mb-1">Wave Speed: {settings.waveSpeed.toFixed(3)}</label>
            <input
              type="range"
              min="0.005"
              max="0.1"
              step="0.005"
              value={settings.waveSpeed}
              onChange={(e) => setSettings(s => ({ ...s, waveSpeed: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </div>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-64 rounded-xl bg-background cursor-crosshair"
        style={{ touchAction: 'none' }}
      />
      <p className="text-xs text-muted-foreground mt-2">Click and drag to create ripples • Max size bubbles in drag radius • Colors change with size</p>
    </div>
  );
}