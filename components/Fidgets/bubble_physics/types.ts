export interface BubbleDot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  originalRadius: number;
  currentRadius: number;
  isExploding: boolean;
  explosionVx: number;
  explosionVy: number;
  opacity: number;
  onGround: boolean;
  groundTime: number;
  mass: number;
  restAngle: number; // The angle this dot wants to be at relative to bubble center
}

export interface Bubble {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  isDragging: boolean;
  dragOffset?: { x: number; y: number };
  targetX?: number;
  targetY?: number;
  deformation: number;
  deformX: number;
  deformY: number;
  rotation: number;
  wobbleTime: number;
  dots: BubbleDot[];
  dragSpeed: number;
  lastX: number;
  lastY: number;
}

export interface BubbleSettings {
  bubbleCount: number;
  gravity: number;
  bounce: number;
  airResistance: number;
  blowForce: number;
}