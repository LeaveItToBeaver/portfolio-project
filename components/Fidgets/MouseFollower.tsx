'use client';
import { useRef, useEffect, useState, useCallback } from 'react';

interface Trail {
  x: number;
  y: number;
  life: number;
}

export default function MouseFollower() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const trailRef = useRef<Trail[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const followerRef = useRef({ x: 0, y: 0 });

  const [settings, setSettings] = useState({
    trailLength: 20,
    followSpeed: 0.1,
    trailFade: 0.05,
    size: 20,
    shape: 'circle' as 'circle' | 'square' | 'triangle'
  });

  const [isHovering, setIsHovering] = useState(false);

  const updateFollower = useCallback(() => {
    // Smooth follow with easing
    const dx = mouseRef.current.x - followerRef.current.x;
    const dy = mouseRef.current.y - followerRef.current.y;

    followerRef.current.x += dx * settings.followSpeed;
    followerRef.current.y += dy * settings.followSpeed;

    // Add to trail
    if (isHovering) {
      trailRef.current.push({
        x: followerRef.current.x,
        y: followerRef.current.y,
        life: 1
      });

      // Limit trail length
      if (trailRef.current.length > settings.trailLength) {
        trailRef.current.shift();
      }
    }

    // Update trail life
    trailRef.current.forEach(point => {
      point.life -= settings.trailFade;
    });

    // Remove dead trail points
    trailRef.current = trailRef.current.filter(point => point.life > 0);
  }, [settings.followSpeed, settings.trailLength, settings.trailFade, isHovering]);

  const draw = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear existing followers
    const existing = container.querySelectorAll('.follower, .trail-point');
    existing.forEach(el => el.remove());

    // Draw trail
    trailRef.current.forEach((point, index) => {
      const trailElement = document.createElement('div');
      trailElement.className = 'trail-point absolute pointer-events-none transition-opacity';
      const size = (settings.size * 0.5) * point.life;
      const opacity = point.life * 0.7;

      trailElement.style.cssText = `
        left: ${point.x - size / 2}px;
        top: ${point.y - size / 2}px;
        width: ${size}px;
        height: ${size}px;
        background: rgba(139, 92, 246, ${opacity});
        border-radius: ${settings.shape === 'circle' ? '50%' : settings.shape === 'square' ? '0' : '0'};
        ${settings.shape === 'triangle' ? `
          width: 0;
          height: 0;
          border-left: ${size / 2}px solid transparent;
          border-right: ${size / 2}px solid transparent;
          border-bottom: ${size}px solid rgba(139, 92, 246, ${opacity});
          background: transparent;
        ` : ''}
      `;

      container.appendChild(trailElement);
    });

    // Draw main follower
    if (isHovering) {
      const follower = document.createElement('div');
      follower.className = 'follower absolute pointer-events-none transition-all duration-75';
      const size = settings.size;

      follower.style.cssText = `
        left: ${followerRef.current.x - size / 2}px;
        top: ${followerRef.current.y - size / 2}px;
        width: ${size}px;
        height: ${size}px;
        background: rgb(139, 92, 246);
        border-radius: ${settings.shape === 'circle' ? '50%' : settings.shape === 'square' ? '0' : '0'};
        box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
        ${settings.shape === 'triangle' ? `
          width: 0;
          height: 0;
          border-left: ${size / 2}px solid transparent;
          border-right: ${size / 2}px solid transparent;
          border-bottom: ${size}px solid rgb(139, 92, 246);
          background: transparent;
        ` : ''}
      `;

      container.appendChild(follower);
    }
  }, [settings, isHovering]);

  const animate = useCallback(() => {
    updateFollower();
    draw();
    animationRef.current = requestAnimationFrame(animate);
  }, [updateFollower, draw]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleMouseEnter = () => {
      setIsHovering(true);
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      trailRef.current = [];
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    animate();

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationRef.current);
    };
  }, [animate]);

  return (
    <div className="w-full h-full min-h-[400px] bg-card rounded-2xl border p-4">
      <div className="mb-4 space-y-3">
        <h3 className="text-lg font-semibold">Mouse Follower</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block text-muted-foreground mb-1">Trail Length: {settings.trailLength}</label>
            <input
              type="range"
              min="5"
              max="500"
              value={settings.trailLength}
              onChange={(e) => setSettings(s => ({ ...s, trailLength: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-muted-foreground mb-1">Follow Speed: {settings.followSpeed.toFixed(2)}</label>
            <input
              type="range"
              min="0.01"
              max="0.5"
              step="0.01"
              value={settings.followSpeed}
              onChange={(e) => setSettings(s => ({ ...s, followSpeed: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-muted-foreground mb-1">Size: {settings.size}</label>
            <input
              type="range"
              min="10"
              max="40"
              value={settings.size}
              onChange={(e) => setSettings(s => ({ ...s, size: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-muted-foreground mb-1">Shape</label>
            <select
              value={settings.shape}
              onChange={(e) => setSettings(s => ({ ...s, shape: e.target.value as any }))}
              className="w-full px-2 py-1 rounded bg-input border border-border text-foreground"
            >
              <option value="circle">Circle</option>
              <option value="square">Square</option>
              <option value="triangle">Triangle</option>
            </select>
          </div>
        </div>
      </div>
      <div
        ref={containerRef}
        className="relative w-full h-64 rounded-xl bg-background border overflow-hidden cursor-none"
      >
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
          {isHovering ? 'Following your mouse...' : 'Move your mouse here'}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">Move your mouse around the area to see the follower in action</p>
    </div>
  );
}