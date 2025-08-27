import { Bubble, BubbleSettings } from './types';

export const blowBubble = (
  x: number,
  y: number,
  bubbles: Bubble[],
  settings: BubbleSettings
) => {
  bubbles.forEach(bubble => {
    const dx = bubble.x - x; // Direction FROM click TO bubble
    const dy = bubble.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const blowRadius = 220;
    if (distance < blowRadius && distance > 0) { // Blow radius, avoid division by zero
      const force = (blowRadius - distance) / blowRadius * settings.blowForce;
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;

      // Apply force away from click point to bubble center
      bubble.vx += normalizedDx * force * 1.2;
      bubble.vy += normalizedDy * force * 1.2;

      // Also apply force to individual dots for deformation effect
      bubble.dots.forEach(dot => {
        if (!dot.isExploding) {
          const dotDx = dot.x - x;
          const dotDy = dot.y - y;
          const dotDistance = Math.sqrt(dotDx * dotDx + dotDy * dotDy);

          if (dotDistance < blowRadius && dotDistance > 0) {
            const dotForce = (blowRadius - dotDistance) / blowRadius * settings.blowForce * 0.3;
            const dotNormalX = dotDx / dotDistance;
            const dotNormalY = dotDy / dotDistance;

            dot.vx += dotNormalX * dotForce;
            dot.vy += dotNormalY * dotForce;
          }
        }
      });

      // Add some random variation for more natural look
      bubble.vx += (Math.random() - 0.5) * force * 0.2;
      bubble.vy += (Math.random() - 0.5) * force * 0.2;

      // brief deformation pulse
      const pulse = Math.min(0.3, force * 0.05);
      bubble.deformX = Math.max(bubble.deformX, pulse);
      bubble.deformY = Math.max(bubble.deformY, pulse * 0.6);
      bubble.rotation = Math.atan2(normalizedDy, normalizedDx);
    }
  });
};

export const popBubble = (
  bubble: Bubble,
  bubbles: Bubble[],
  settings: BubbleSettings,
  clickX?: number,
  clickY?: number
) => {
  // First, create explosion blast that affects nearby bubbles
  const blastRadius = 120; // Large blast radius
  const blastForce = settings.blowForce * 1.5; // Stronger than normal blow

  bubbles.forEach(otherBubble => {
    if (otherBubble.id !== bubble.id) { // Don't affect the popping bubble
      const dx = otherBubble.x - bubble.x;
      const dy = otherBubble.y - bubble.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < blastRadius && distance > 0) {
        const force = (blastRadius - distance) / blastRadius * blastForce;
        const normalizedDx = dx / distance;
        const normalizedDy = dy / distance;

        // Apply blast force to nearby bubbles
        otherBubble.vx += normalizedDx * force * 0.8;
        otherBubble.vy += normalizedDy * force * 0.8;

        // Also affect individual dots for deformation
        otherBubble.dots.forEach(dot => {
          if (!dot.isExploding) {
            const dotDx = dot.x - bubble.x;
            const dotDy = dot.y - bubble.y;
            const dotDist = Math.sqrt(dotDx * dotDx + dotDy * dotDy);

            if (dotDist < blastRadius) {
              const dotForce = (blastRadius - dotDist) / blastRadius * force * 0.3;
              const dotNormX = dotDist > 0 ? dotDx / dotDist : 1;
              const dotNormY = dotDist > 0 ? dotDy / dotDist : 0;

              dot.vx += dotNormX * dotForce;
              dot.vy += dotNormY * dotForce;
            }
          }
        });
      }
    }
  });

  // Now explode the actual bubble with slower, more dramatic effect
  bubble.dots.forEach(dot => {
    dot.isExploding = true;

    // Calculate direction from click point (or bubble center)
    const centerX = clickX || bubble.x;
    const centerY = clickY || bubble.y;
    const dx = dot.x - centerX;
    const dy = dot.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy) || 0.0001;

    // Normalize direction
    const normalX = dx / distance;
    const normalY = dy / distance;

    // Much slower, more dramatic explosion
    const explosionForce = settings.blowForce * 0.15 + Math.random() * settings.blowForce * 0.1; // Much slower
    dot.explosionVx = normalX * explosionForce + (Math.random() - 0.5) * explosionForce * 0.2;
    dot.explosionVy = normalY * explosionForce + (Math.random() - 0.5) * explosionForce * 0.2;

    dot.onGround = false;
    dot.groundTime = 0;
  });
};

export const handleDragDeformation = (
  bubble: Bubble,
  mouseRef: { current: { x: number; y: number; isDown: boolean } },
  lastMouseRef: { current: { x: number; y: number } }
) => {
  // Enhanced deformation based on drag speed and acceleration
  const mdx = mouseRef.current.x - lastMouseRef.current.x;
  const mdy = mouseRef.current.y - lastMouseRef.current.y;
  const dragSpeed = Math.hypot(mdx, mdy);
  const acceleration = Math.hypot(bubble.vx, bubble.vy);

  // More dynamic deformation
  const maxDef = 0.6;
  const speedDef = Math.min(maxDef, dragSpeed * 0.04);
  const accelDef = Math.min(maxDef, acceleration * 0.03);
  const totalDef = Math.max(speedDef, accelDef);

  // Deform in direction of movement with more pronounced effect
  if (totalDef > 0.1) {
    bubble.deformX = Math.max(bubble.deformX, totalDef);
    bubble.deformY = Math.max(bubble.deformY, totalDef * 0.7);
    bubble.rotation = Math.atan2(bubble.vy, bubble.vx);
  }

  // Keep some wobble even when stationary
  const targetX = mouseRef.current.x + (bubble.dragOffset?.x || 0);
  const targetY = mouseRef.current.y + (bubble.dragOffset?.y || 0);
  const distance = Math.hypot(targetX - bubble.x, targetY - bubble.y);
  if (distance > 5) {
    const wobble = Math.sin(Date.now() * 0.01) * 0.1;
    bubble.deformX = Math.max(bubble.deformX, wobble);
    bubble.deformY = Math.max(bubble.deformY, wobble * 0.5);
  }
};

export const applyThrowMomentum = (
  bubble: Bubble,
  mouseVelocityRef: { current: { vx: number; vy: number } }
) => {
  // Use smoothed mouse velocity for more consistent heavy tossing
  const mouseDx = mouseVelocityRef.current.vx;
  const mouseDy = mouseVelocityRef.current.vy;

  // Stronger momentum for heavier water balloon feel
  const momentumMultiplier = 1.5;
  bubble.vx = mouseDx * momentumMultiplier;
  bubble.vy = mouseDy * momentumMultiplier;

  // Give momentum to individual dots with weight distribution
  bubble.dots.forEach(dot => {
    if (!dot.isExploding) {
      // Water slosh based on dot position relative to throw direction
      const dotAngle = Math.atan2(dot.y - bubble.y, dot.x - bubble.x);
      const throwAngle = Math.atan2(mouseDy, mouseDx);
      const angleDiff = Math.abs(dotAngle - throwAngle);

      // Dots in direction of throw get more momentum
      const directionFactor = 0.4 + (1 - Math.min(angleDiff, Math.PI) / Math.PI) * 0.4;
      const sloshFactor = 0.7 + Math.random() * 0.3;

      dot.vx += mouseDx * momentumMultiplier * directionFactor * sloshFactor;
      dot.vy += mouseDy * momentumMultiplier * directionFactor * sloshFactor;
    }
  });
};