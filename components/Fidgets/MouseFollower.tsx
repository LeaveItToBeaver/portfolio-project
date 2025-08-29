'use client';
import { useRef, useEffect, useState, useCallback } from 'react';
import { MousePhysics, type Point, type Vector, type BounceBall } from './utils/MousePhysics';

interface Trail {
  x: number;
  y: number;
  life: number;
}

export default function MouseFollower() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const ballsRef = useRef<BounceBall[]>([]);
  const trailsRef = useRef<{ [ballId: string]: Trail[] }>({});
  const mouseRef = useRef<Point>({ x: 0, y: 0 });
  const previousMouseRef = useRef<Point>({ x: 0, y: 0 });
  const mouseVelocityRef = useRef<Vector>({ x: 0, y: 0 });
  const lastTimeRef = useRef<number>(0);
  const draggedBallRef = useRef<BounceBall | null>(null);
  const isMouseDownRef = useRef<boolean>(false);

  const [settings, setSettings] = useState({
    trailLength: 12,
    ballSize: 25,
    gooeyTension: 0.8,
    bounceStrength: 0.4,
    friction: 0.995
  });

  const [ballCount, setBallCount] = useState(0);

  const updatePhysics = useCallback((currentTime: number) => {
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    const container = containerRef.current;
    if (!container) return;

    const bounds = { width: container.offsetWidth, height: container.offsetHeight };

    // Calculate mouse velocity
    mouseVelocityRef.current = MousePhysics.calculateMouseVelocity(
      mouseRef.current,
      previousMouseRef.current,
      Math.max(deltaTime, 1)
    );
    previousMouseRef.current = { ...mouseRef.current };

    // Update dragged ball position
    if (draggedBallRef.current && isMouseDownRef.current) {
      const ball = draggedBallRef.current;
      if (ball.dragOffset) {
        ball.position.x = mouseRef.current.x - ball.dragOffset.x;
        ball.position.y = mouseRef.current.y - ball.dragOffset.y;

        // Keep dragged ball in bounds
        ball.position = MousePhysics.constrainMouseToBounds(ball.position, {
          width: bounds.width - ball.radius,
          height: bounds.height - ball.radius
        });
        ball.position.x = Math.max(ball.radius, ball.position.x);
        ball.position.y = Math.max(ball.radius, ball.position.y);

        // Trail will be handled in the main physics update
      }
    }

    // Update all ball physics and trails
    ballsRef.current.forEach(ball => {
      const previousPosition = { ...ball.position };

      if (!ball.isDragging) {
        MousePhysics.updateBallPhysics(ball, bounds, deltaTime);
      }

      // Add trail for any ball that moved
      const moved = MousePhysics.distance(previousPosition, ball.position) > 0.5 || ball.isDragging;
      if (moved) {
        if (!trailsRef.current[ball.id]) trailsRef.current[ball.id] = [];
        trailsRef.current[ball.id].unshift({
          x: ball.position.x,
          y: ball.position.y,
          life: 1
        });

        // Limit trail length
        if (trailsRef.current[ball.id].length > settings.trailLength) {
          trailsRef.current[ball.id].pop();
        }
      }
    });

    // Check ball-to-ball collisions
    for (let i = 0; i < ballsRef.current.length; i++) {
      for (let j = i + 1; j < ballsRef.current.length; j++) {
        const ball1 = ballsRef.current[i];
        const ball2 = ballsRef.current[j];

        if (MousePhysics.checkBallCollision(ball1, ball2)) {
          MousePhysics.resolveBallCollision(ball1, ball2);
        }
      }
    }

    // Update trails for all balls
    Object.keys(trailsRef.current).forEach(ballId => {
      const trail = trailsRef.current[ballId];
      trail.forEach(point => {
        point.life -= 0.015;
      });
      trailsRef.current[ballId] = trail.filter(point => point.life > 0);
    });

    setBallCount(ballsRef.current.length);
  }, [settings.trailLength, settings.ballSize]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw trails for each ball
    ballsRef.current.forEach(ball => {
      const trail = trailsRef.current[ball.id];
      if (!trail || trail.length < 2) return;

      // Draw tapered gooey bezier tail for this ball
      for (let i = 1; i < trail.length; i++) {
        const current = trail[i];
        const previous = trail[i - 1];

        // Calculate taper - wider at ball, narrower at tail end
        const tailProgress = i / (trail.length - 1);
        const baseWidth = settings.ballSize * 0.7;
        const taperWidth = baseWidth * (1 - tailProgress * 0.9);

        // Calculate control points for gooey effect
        const tension = settings.gooeyTension;
        const distance = MousePhysics.distance(current, previous);
        const controlOffset = Math.min(distance * tension * (1 - tailProgress * 0.3), 25);

        const cp1x = previous.x + (current.x - previous.x) * 0.3 + Math.sin(i * 0.2) * controlOffset * 0.5;
        const cp1y = previous.y + (current.y - previous.y) * 0.3 + Math.cos(i * 0.2) * controlOffset * 0.5;

        const cp2x = previous.x + (current.x - previous.x) * 0.7 + Math.sin(i * 0.4) * controlOffset * 0.2;
        const cp2y = previous.y + (current.y - previous.y) * 0.7 + Math.cos(i * 0.4) * controlOffset * 0.2;

        // Draw segment
        ctx.beginPath();
        ctx.moveTo(previous.x, previous.y);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, current.x, current.y);

        // Style with gradient and taper
        const alpha = current.life * (1 - tailProgress * 0.4);
        ctx.strokeStyle = ball.color.replace('1)', `${alpha})`);
        ctx.lineWidth = Math.max(1, taperWidth);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = taperWidth * 0.3;
        ctx.shadowColor = ball.color.replace('1)', `${alpha * 0.3})`);
        ctx.stroke();
      }
    });

    // Draw all balls
    ballsRef.current.forEach(ball => {
      ctx.save();
      ctx.fillStyle = ball.color;
      ctx.shadowBlur = ball.isDragging ? 20 : 12;
      ctx.shadowColor = ball.color.replace('1)', '0.6)');

      // Draw ball
      ctx.beginPath();
      ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw highlight when dragging
      if (ball.isDragging) {
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(ball.position.x - ball.radius * 0.3, ball.position.y - ball.radius * 0.3, ball.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }, [settings]);

  const animate = useCallback((currentTime: number) => {
    updatePhysics(currentTime);
    draw();
    animationRef.current = requestAnimationFrame(animate);
  }, [updatePhysics, draw]);

  const createBall = useCallback((x: number, y: number, color?: string) => {
    const colors = [
      'rgba(156, 127, 171, 1)',
      'rgba(200, 253, 201, 1)',
      'rgba(255, 182, 193, 1)',
      'rgba(173, 216, 230, 1)',
      'rgba(255, 218, 185, 1)',
      'rgba(221, 160, 221, 1)',
      'rgba(255, 165, 0, 1)',
      'rgba(75, 0, 130, 1)',
      'rgba(255, 20, 147, 1)'
    ];

    const newBall: BounceBall = {
      id: `ball-${Date.now()}-${Math.random()}`,
      position: { x, y },
      velocity: { x: 0, y: 0 },
      radius: settings.ballSize / 2,
      color: color || colors[ballsRef.current.length % colors.length],
      isDragging: true,
      dragOffset: { x: 0, y: 0 }
    };

    ballsRef.current.push(newBall);
    trailsRef.current[newBall.id] = [];
    draggedBallRef.current = newBall;

    return newBall;
  }, [settings.ballSize]);

  const setupBilliardRack = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Clear existing balls
    ballsRef.current = [];
    trailsRef.current = {};

    const ballRadius = settings.ballSize / 2;
    const spacing = ballRadius * 2.1; // Slight gap between balls

    // Position rack on right side of canvas with point facing left
    const rackStartX = canvas.width - 120;
    const rackStartY = canvas.height / 2;

    // Create triangular rack formation (5 rows: 1,2,3,4,5) - point on left
    const colors = [
      'rgba(255, 215, 0, 1)',     // Gold (1 ball)
      'rgba(156, 127, 171, 1)',   // Purple
      'rgba(200, 253, 201, 1)',   // Green
      'rgba(255, 182, 193, 1)',   // Pink
      'rgba(173, 216, 230, 1)',   // Light Blue
      'rgba(255, 165, 0, 1)',     // Orange
      'rgba(75, 0, 130, 1)',      // Indigo
      'rgba(255, 20, 147, 1)',    // Deep Pink
      'rgba(124, 252, 0, 1)'      // Lawn Green
    ];

    let ballIndex = 0;

    // Create 5 rows of balls in triangular formation with point on left
    for (let row = 0; row < 5; row++) {
      const ballsInRow = 5 - row; // 5, 4, 3, 2, 1
      const rowOffsetX = row * spacing * 0.866; // 60-degree offset

      for (let col = 0; col < ballsInRow; col++) {
        const x = rackStartX - rowOffsetX;
        const y = rackStartY + (col - (ballsInRow - 1) / 2) * spacing;

        // Ensure balls stay in bounds
        const clampedX = Math.max(ballRadius, Math.min(canvas.width - ballRadius, x));
        const clampedY = Math.max(ballRadius, Math.min(canvas.height - ballRadius, y));

        const ball: BounceBall = {
          id: `rack-ball-${ballIndex}`,
          position: { x: clampedX, y: clampedY },
          velocity: { x: 0, y: 0 },
          radius: ballRadius,
          color: colors[ballIndex % colors.length],
          isDragging: false
        };

        ballsRef.current.push(ball);
        trailsRef.current[ball.id] = [];
        ballIndex++;
      }
    }

    setBallCount(ballsRef.current.length);
  }, [settings.ballSize]);

  const findBallAtPoint = useCallback((point: Point): BounceBall | null => {
    return ballsRef.current.find(ball => MousePhysics.isPointInBall(point, ball)) || null;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleMouseDown = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mousePos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      isMouseDownRef.current = true;

      // Check if clicking on existing ball
      const clickedBall = findBallAtPoint(mousePos);
      if (clickedBall) {
        // Start dragging existing ball
        draggedBallRef.current = clickedBall;
        clickedBall.isDragging = true;
        clickedBall.dragOffset = {
          x: mousePos.x - clickedBall.position.x,
          y: mousePos.y - clickedBall.position.y
        };
      } else {
        // Create new ball at mouse position
        const newBall = createBall(mousePos.x, mousePos.y);
        newBall.dragOffset = { x: 0, y: 0 };
      }
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;

      if (draggedBallRef.current) {
        const ball = draggedBallRef.current;
        ball.isDragging = false;

        // Apply release velocity based on mouse movement
        const velocityScale = settings.bounceStrength * 10;
        ball.velocity.x = mouseVelocityRef.current.x * velocityScale;
        ball.velocity.y = mouseVelocityRef.current.y * velocityScale;

        draggedBallRef.current = null;
      }
    };

    const handleMouseLeave = () => {
      // If dragging a ball when leaving, it should bounce around
      if (draggedBallRef.current) {
        const ball = draggedBallRef.current;
        ball.isDragging = false;

        // Give it exit velocity
        const velocityScale = settings.bounceStrength * 15;
        ball.velocity.x = mouseVelocityRef.current.x * velocityScale;
        ball.velocity.y = mouseVelocityRef.current.y * velocityScale;

        draggedBallRef.current = null;
      }
      isMouseDownRef.current = false;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseLeave);

    // Prevent context menu
    container.addEventListener('contextmenu', (e) => e.preventDefault());

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [animate, createBall, findBallAtPoint, settings.bounceStrength]);

  return (
    <div className="w-full h-full min-h-[400px] bg-card rounded-2xl border p-4">
      <div className="mb-4 space-y-3">
        <h3 className="text-lg font-semibold">2D Ball Physicis</h3>
        <div className="text-sm bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 text-blue-300">
          {ballCount} ball{ballCount !== 1 ? 's' : ''} • Click to create • Drag to move • Release to launch
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block text-muted-foreground mb-1">Trail Length: {settings.trailLength}</label>
            <input
              type="range"
              min="5"
              max="25"
              value={settings.trailLength}
              onChange={(e) => setSettings(s => ({ ...s, trailLength: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-muted-foreground mb-1">Ball Size: {settings.ballSize}</label>
            <input
              type="range"
              min="15"
              max="40"
              value={settings.ballSize}
              onChange={(e) => setSettings(s => ({ ...s, ballSize: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-muted-foreground mb-1">Gooey Tension: {settings.gooeyTension.toFixed(1)}</label>
            <input
              type="range"
              min="0.2"
              max="1.5"
              step="0.1"
              value={settings.gooeyTension}
              onChange={(e) => setSettings(s => ({ ...s, gooeyTension: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-muted-foreground mb-1">Bounce Power: {settings.bounceStrength.toFixed(1)}</label>
            <input
              type="range"
              min="0.1"
              max="0.8"
              step="0.1"
              value={settings.bounceStrength}
              onChange={(e) => setSettings(s => ({ ...s, bounceStrength: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={setupBilliardRack}
            className="px-3 py-1 text-xs rounded bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30 transition-colors"
          >
            Setup Rack (15 balls)
          </button>
          <button
            onClick={() => {
              ballsRef.current = [];
              trailsRef.current = {};
              setBallCount(0);
            }}
            className="px-3 py-1 text-xs rounded bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="relative w-full h-64 rounded-xl bg-background border overflow-hidden select-none"
        style={{ cursor: 'crosshair' }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
        {ballCount === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm pointer-events-none">
            Click and drag to create bouncy balls
          </div>
        )}
        {ballCount > 0 && (
          <div className="absolute top-2 left-2 text-xs text-muted-foreground pointer-events-none">
            Drag balls around • They collide and bounce!
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Click to create balls, drag them around, and watch them interact like billiard balls with trails.
      </p>
    </div>
  );
}