import { Bubble, BubbleDot } from './types';

const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export const createBubble = (canvas: HTMLCanvasElement): Bubble => {
  const radius = Math.random() * 20 + 15; // Smaller bubbles (was 30 + 20)
  const x = Math.random() * (canvas.width - radius * 2) + radius;
  const y = Math.random() * (canvas.height - radius * 2) + radius;

  // Smaller dots, more of them for water balloon effect
  const dotSize = 5; // Smaller dots (was 8)
  const circumference = 2 * Math.PI * radius;
  const dotSpacing = dotSize * 1.2; // Much closer spacing for more dots
  const numDots = Math.max(12, Math.floor(circumference / dotSpacing)); // More minimum dots

  const dots: BubbleDot[] = [];

  for (let i = 0; i < numDots; i++) {
    const angle = (i / numDots) * Math.PI * 2;
    dots.push({
      x: x + Math.cos(angle) * radius,
      y: y + Math.sin(angle) * radius,
      vx: 0,
      vy: 0,
      angle,
      originalRadius: radius,
      currentRadius: radius,
      isExploding: false,
      explosionVx: 0,
      explosionVy: 0,
      opacity: 1,
      onGround: false,
      groundTime: 0,
      mass: 1 + Math.random() * 0.2, // Less mass variation
      restAngle: angle // Remember the original rest position
    });
  }

  return {
    id: Date.now() + Math.random(),
    x,
    y,
    vx: (Math.random() - 0.5) * 4,
    vy: (Math.random() - 0.5) * 4,
    radius,
    color: colors[Math.floor(Math.random() * colors.length)],
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    deformation: 0,
    deformX: 0,
    deformY: 0,
    rotation: 0,
    wobbleTime: 0,
    dots,
    dragSpeed: 0,
    lastX: x,
    lastY: y
  };
};

export const createNewBubble = (x: number, y: number, canvas: HTMLCanvasElement): Bubble => {
  const radius = Math.random() * 18 + 12; // Smaller bubbles
  const circumference = 2 * Math.PI * radius;
  const dotSpacing = 5 * 1.2; // Same spacing as createBubble - smaller dots
  const numDots = Math.max(12, Math.floor(circumference / dotSpacing));
  const dots: BubbleDot[] = [];

  for (let i = 0; i < numDots; i++) {
    const angle = (i / numDots) * Math.PI * 2;
    dots.push({
      x: x + Math.cos(angle) * radius,
      y: y + Math.sin(angle) * radius,
      vx: 0,
      vy: 0,
      angle,
      originalRadius: radius,
      currentRadius: radius,
      isExploding: false,
      explosionVx: 0,
      explosionVy: 0,
      opacity: 1,
      onGround: false,
      groundTime: 0,
      mass: 1 + Math.random() * 0.5,
      restAngle: angle
    });
  }

  const newBubble: Bubble = {
    id: Date.now() + Math.random(),
    x: Math.max(radius, Math.min(canvas.width - radius, x)),
    y: Math.max(radius, Math.min(canvas.height - radius, y)),
    vx: (Math.random() - 0.5) * 3,
    vy: (Math.random() - 0.5) * 3,
    radius,
    color: colors[Math.floor(Math.random() * colors.length)],
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    deformation: 0,
    deformX: 0,
    deformY: 0,
    rotation: 0,
    wobbleTime: 0,
    dots,
    dragSpeed: 0,
    lastX: x,
    lastY: y
  };

  return newBubble;
};

export const getBubbleAt = (x: number, y: number, bubbles: Bubble[]): Bubble | null => {
  for (const bubble of bubbles) {
    const dx = x - bubble.x;
    const dy = y - bubble.y;
    if (Math.sqrt(dx * dx + dy * dy) <= bubble.radius) {
      return bubble;
    }
  }
  return null;
};