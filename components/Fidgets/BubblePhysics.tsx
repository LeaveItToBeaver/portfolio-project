'use client';
import { useRef, useEffect, useState, useCallback } from 'react';
import { Bubble, BubbleSettings } from './bubble_physics/types';
import { createBubble, createNewBubble, getBubbleAt } from './bubble_physics/utils';
import { 
  updateBubbles, 
  handleBubbleCollisions, 
  handleExplodingDotPhysics, 
  handleDotCollisions 
} from './bubble_physics/physics';
import { draw, animate } from './bubble_physics/renderer';
import { 
  blowBubble, 
  popBubble, 
  handleDragDeformation, 
  applyThrowMomentum 
} from './bubble_physics/interactions';

export default function BubblePhysics() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const bubblesRef = useRef<Bubble[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, isDown: false });
  const draggedBubbleRef = useRef<Bubble | null>(null);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const mouseVelocityRef = useRef({ vx: 0, vy: 0 }); // Track mouse velocity over time
  const clickTimeRef = useRef(0);
  const doubleClickHoldRef = useRef(false);
  const bubbleCreationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const settingsRef = useRef<BubbleSettings>({
    bubbleCount: 8,
    gravity: 0.3,
    bounce: 0.8,
    airResistance: 0.99,
    blowForce: 14
  });

  const [settings, setSettings] = useState<BubbleSettings>({
    bubbleCount: 8,
    gravity: 0.3,
    bounce: 0.8,
    airResistance: 0.99,
    blowForce: 14
  });

  // Update settings ref
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);


  const initBubbles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    bubblesRef.current = Array.from({ length: settings.bubbleCount }, () => createBubble(canvas));
  }, [settings.bubbleCount]);

  const updatePhysics = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const currentSettings = settingsRef.current;

    // Update bubble physics
    updateBubbles(bubblesRef.current, canvas, currentSettings, mouseRef);
    
    // Handle bubble collisions
    handleBubbleCollisions(bubblesRef.current);

    // Handle drag deformation for dragged bubbles
    bubblesRef.current.forEach(bubble => {
      if (bubble.isDragging) {
        handleDragDeformation(bubble, mouseRef, lastMouseRef);
      }
    });
  };

  const renderFrame = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const currentSettings = settingsRef.current;

    // Handle exploding dot physics
    handleExplodingDotPhysics(bubblesRef.current, canvas, currentSettings);
    
    // Handle dot collisions
    handleDotCollisions(bubblesRef.current, currentSettings);

    // Draw everything
    draw(canvas, ctx, bubblesRef.current);

    // Remove bubbles with all dots faded out
    bubblesRef.current = bubblesRef.current.filter(bubble =>
      bubble.dots.some(dot => dot.opacity > 0)
    );
  };

  const startAnimation = () => {
    const animateFrame = () => {
      updatePhysics();
      renderFrame();
      animationRef.current = requestAnimationFrame(animateFrame);
    };
    animateFrame();
  };




  const handleCreateNewBubble = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newBubble = createNewBubble(x, y, canvas);
    bubblesRef.current.push(newBubble);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initBubbles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      lastMouseRef.current.x = mouseRef.current.x;
      lastMouseRef.current.y = mouseRef.current.y;
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;

      // Track mouse velocity for better tossing physics - longer history
      const currentVx = mouseRef.current.x - lastMouseRef.current.x;
      const currentVy = mouseRef.current.y - lastMouseRef.current.y;

      // More responsive velocity tracking for heavier feel
      mouseVelocityRef.current.vx = mouseVelocityRef.current.vx * 0.6 + currentVx * 0.4;
      mouseVelocityRef.current.vy = mouseVelocityRef.current.vy * 0.6 + currentVy * 0.4;
    };

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const now = Date.now();

      const bubble = getBubbleAt(x, y, bubblesRef.current);

      // Check for double click timing
      const isDoubleClick = now - clickTimeRef.current < 300;
      clickTimeRef.current = now;

      if (isDoubleClick && !bubble) {
        // Double click in empty space - start creating bubbles
        doubleClickHoldRef.current = true;
        handleCreateNewBubble(x, y);

        // Set up continuous bubble creation while holding
        bubbleCreationTimerRef.current = setInterval(() => {
          if (doubleClickHoldRef.current) {
            const offsetX = x + (Math.random() - 0.5) * 60;
            const offsetY = y + (Math.random() - 0.5) * 60;
            handleCreateNewBubble(offsetX, offsetY);
          }
        }, 200);
      } else if (bubble) {
        if (isDoubleClick) {
          // Double click on bubble - start dragging (don't pop)
          bubble.isDragging = true;
          bubble.dragOffset = {
            x: bubble.x - x,
            y: bubble.y - y
          };
          draggedBubbleRef.current = bubble;
        } else {
          // Single click on bubble - prepare for potential pop or drag
          setTimeout(() => {
            // If it wasn't a double click, pop the bubble with explosion
            if (Date.now() - clickTimeRef.current >= 250 && !bubble.isDragging) {
              popBubble(bubble, bubblesRef.current, settingsRef.current, x, y);
            }
          }, 250);

          // Also start dragging in case they want to drag
          bubble.isDragging = true;
          bubble.dragOffset = {
            x: bubble.x - x,
            y: bubble.y - y
          };
          draggedBubbleRef.current = bubble;
        }
      } else {
        // Single click in empty space - blow force
        setTimeout(() => {
          // Only blow if it wasn't a double click
          if (Date.now() - clickTimeRef.current >= 250) {
            blowBubble(x, y, bubblesRef.current, settingsRef.current);
          }
        }, 250);
      }

      mouseRef.current.isDown = true;
    };

    const handleMouseUp = () => {
      if (draggedBubbleRef.current) {
        applyThrowMomentum(draggedBubbleRef.current, mouseVelocityRef);
        draggedBubbleRef.current.isDragging = false;
        draggedBubbleRef.current = null;
      }

      // Reset velocity tracking
      mouseVelocityRef.current.vx = 0;
      mouseVelocityRef.current.vy = 0;      // Stop continuous bubble creation
      doubleClickHoldRef.current = false;
      if (bubbleCreationTimerRef.current) {
        clearInterval(bubbleCreationTimerRef.current);
        bubbleCreationTimerRef.current = null;
      }

      mouseRef.current.isDown = false;
    };

    const handleDoubleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      blowBubble(x, y, bubblesRef.current, settingsRef.current);
    };

    // Initialize canvas and events
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    // Start animation
    startAnimation();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      if (bubbleCreationTimerRef.current) {
        clearInterval(bubbleCreationTimerRef.current);
      }
      cancelAnimationFrame(animationRef.current);
    };
  }, []); // Empty dependency array - run only once

  return (
    <div className="w-full h-full min-h-[400px] bg-card rounded-2xl border p-4">
      <div className="mb-4 space-y-3">
        <h3 className="text-lg font-semibold">Bubble Physics</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block text-muted-foreground mb-1">Bubbles: {settings.bubbleCount}</label>
            <input
              type="range"
              min="3"
              max="15"
              value={settings.bubbleCount}
              onChange={(e) => setSettings(s => ({ ...s, bubbleCount: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-muted-foreground mb-1">Gravity: {settings.gravity.toFixed(1)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.gravity}
              onChange={(e) => setSettings(s => ({ ...s, gravity: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-muted-foreground mb-1">Bounce: {settings.bounce.toFixed(1)}</label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={settings.bounce}
              onChange={(e) => setSettings(s => ({ ...s, bounce: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-muted-foreground mb-1">Blow Force: {settings.blowForce}</label>
            <input
              type="range"
              min="5"
              max="30"
              value={settings.blowForce}
              onChange={(e) => setSettings(s => ({ ...s, blowForce: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-64 rounded-xl bg-background cursor-grab active:cursor-grabbing border"
      />
      <p className="text-xs text-muted-foreground mt-2">Click to pop bubbles or blow others away • Double-click and hold to create new bubbles • Drag to move them around • Bounce slider controls formation tightness</p>
    </div>
  );
}