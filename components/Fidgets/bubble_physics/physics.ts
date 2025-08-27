import { Bubble, BubbleDot, BubbleSettings } from './types';

export const updateBubbles = (
  bubbles: Bubble[],
  canvas: HTMLCanvasElement,
  settings: BubbleSettings,
  mouseRef: { current: { x: number; y: number; isDown: boolean } }
) => {
  bubbles.forEach(bubble => {
    if (!bubble.isDragging) {
      // Heavy water balloon physics
      bubble.vy += settings.gravity * 0.25; // Much heavier gravity
      bubble.vx *= 0.985; // More air resistance for weight
      bubble.vy *= 0.985;

      // Update bubble position
      bubble.x += bubble.vx;
      bubble.y += bubble.vy;

      // Wall collisions for bubble
      const k = 0.3;
      const damping = 0.8;

      // Left wall
      const leftPenetration = bubble.radius - bubble.x;
      if (leftPenetration > 0) {
        bubble.vx += k * leftPenetration;
        bubble.x += leftPenetration * 0.5;
        bubble.vx *= -damping * settings.bounce * 1.2;
      }
      // Right wall
      const rightPenetration = bubble.x + bubble.radius - canvas.width;
      if (rightPenetration > 0) {
        bubble.vx -= k * rightPenetration;
        bubble.x -= rightPenetration * 0.5;
        bubble.vx *= -damping * settings.bounce * 1.2;
      }
      // Top wall
      const topPenetration = bubble.radius - bubble.y;
      if (topPenetration > 0) {
        bubble.vy += k * topPenetration;
        bubble.y += topPenetration * 0.5;
        bubble.vy *= -damping * settings.bounce * 1.2;
      }
      // Bottom wall
      const bottomPenetration = bubble.y + bubble.radius - canvas.height;
      if (bottomPenetration > 0) {
        bubble.vy -= k * bottomPenetration;
        bubble.y -= bottomPenetration * 0.5;
        bubble.vy *= -damping * settings.bounce * 1.3;
      }

      // Update dots with individual boundary reactions and very loose formation
      bubble.dots.forEach((dot, i) => {
        if (!dot.isExploding) {
          // Individual dot boundary deformation (water balloon effect)
          const dotRadius = 5; // Match new dot size
          let boundaryDeformX = 0;
          let boundaryDeformY = 0;

          // Check each wall and apply deformation forces to individual dots
          if (dot.x - dotRadius < 10) { // Near left wall
            boundaryDeformX = (10 - (dot.x - dotRadius)) * 0.1; // Push right
          }
          if (dot.x + dotRadius > canvas.width - 10) { // Near right wall
            boundaryDeformX = -((dot.x + dotRadius) - (canvas.width - 10)) * 0.1; // Push left
          }
          if (dot.y - dotRadius < 10) { // Near top wall
            boundaryDeformY = (10 - (dot.y - dotRadius)) * 0.1; // Push down
          }
          if (dot.y + dotRadius > canvas.height - 10) { // Near bottom wall
            boundaryDeformY = -((dot.y + dotRadius) - (canvas.height - 10)) * 0.15; // Push up more for ground squash
          }

          // Formation tightness controlled by bounce slider
          const targetX = bubble.x + Math.cos(dot.restAngle) * bubble.radius + boundaryDeformX * 20;
          const targetY = bubble.y + Math.sin(dot.restAngle) * bubble.radius + boundaryDeformY * 20;

          // Spring force controlled by bounce setting (0.1 = loose, 1.0 = tight)
          const springForce = 0.003 + (settings.bounce * 0.015); // Range: 0.0045 to 0.018
          dot.vx += (targetX - dot.x) * springForce;
          dot.vy += (targetY - dot.y) * springForce;

          // Add individual dot gravity for water weight effect
          dot.vy += settings.gravity * 0.08; // More individual gravity

          // Heavier damping for water weight
          dot.vx *= 0.92; // More damping for weight
          dot.vy *= 0.92;

          dot.x += dot.vx;
          dot.y += dot.vy;
        }
      });
    } else if (bubble.dragOffset) {
      // HEAVY WATER BALLOON DRAG: Significant mass and inertia
      const targetX = mouseRef.current.x + bubble.dragOffset.x;
      const targetY = mouseRef.current.y + bubble.dragOffset.y;

      // Water balloon weight - always affected by gravity even when dragging
      bubble.vy += settings.gravity * 0.15; // Constant downward pull

      // Calculate drag force - much stronger but with heavy resistance
      const dragForceX = (targetX - bubble.x) * 0.15; // Stronger pull
      const dragForceY = (targetY - bubble.y) * 0.15;

      // Heavy mass resistance - significant inertia
      const massInertia = 0.75; // Very heavy feeling (lower = more mass)
      bubble.vx = bubble.vx * massInertia + dragForceX * (1 - massInertia);
      bubble.vy = bubble.vy * massInertia + dragForceY * (1 - massInertia);

      // Update bubble position
      bubble.x += bubble.vx;
      bubble.y += bubble.vy;

      // Apply same loose water balloon physics to each dot as when free-floating
      bubble.dots.forEach((dot, i) => {
        if (!dot.isExploding) {
          // Same boundary deformation as free-floating
          const dotRadius = 5;
          let boundaryDeformX = 0;
          let boundaryDeformY = 0;

          // Check each wall and apply deformation forces
          if (dot.x - dotRadius < 10) {
            boundaryDeformX = (10 - (dot.x - dotRadius)) * 0.1;
          }
          if (dot.x + dotRadius > canvas.width - 10) {
            boundaryDeformX = -((dot.x + dotRadius) - (canvas.width - 10)) * 0.1;
          }
          if (dot.y - dotRadius < 10) {
            boundaryDeformY = (10 - (dot.y - dotRadius)) * 0.1;
          }
          if (dot.y + dotRadius > canvas.height - 10) {
            boundaryDeformY = -((dot.y + dotRadius) - (canvas.height - 10)) * 0.15;
          }

          // Formation controlled by bounce setting - same as free-floating
          const targetDotX = bubble.x + Math.cos(dot.restAngle) * bubble.radius + boundaryDeformX * 20;
          const targetDotY = bubble.y + Math.sin(dot.restAngle) * bubble.radius + boundaryDeformY * 20;

          // Spring force controlled by bounce setting
          const springForce = 0.003 + (settings.bounce * 0.015);
          dot.vx += (targetDotX - dot.x) * springForce;
          dot.vy += (targetDotY - dot.y) * springForce;

          // Water weight - dots sag under gravity even when dragged
          dot.vy += settings.gravity * 0.06; // Constant gravity pull

          // Make bottom dots sag more (water weight distribution)
          const dotAngleFromTop = Math.atan2(dot.y - bubble.y, dot.x - bubble.x);
          const sagEffect = Math.sin(dotAngleFromTop) * 0.5; // Bottom dots sag more
          if (sagEffect > 0) { // Only bottom dots
            dot.vy += sagEffect * settings.gravity * 0.1;
          }

          // Heavier damping for dragged water balloon
          dot.vx *= 0.88; // Heavy damping
          dot.vy *= 0.88;

          dot.x += dot.vx;
          dot.y += dot.vy;
        }
      });
    }
  });
};

export const handleBubbleCollisions = (bubbles: Bubble[]) => {
  // Bubble-to-bubble collisions
  for (let i = 0; i < bubbles.length; i++) {
    for (let j = i + 1; j < bubbles.length; j++) {
      const b1 = bubbles[i];
      const b2 = bubbles[j];

      const dx = b2.x - b1.x;
      const dy = b2.y - b1.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 0.0001;
      const minDistance = b1.radius + b2.radius;

      if (distance < minDistance + 2) { // Start deformation before actual collision
        const overlap = minDistance - distance;

        // Apply deformation to individual dots near the collision (water balloon effect)
        const collisionForce = Math.max(0, (minDistance + 20 - distance) / 20) * 0.12;

        b1.dots.forEach(dot => {
          if (!dot.isExploding) {
            const dotDx = dot.x - b2.x;
            const dotDy = dot.y - b2.y;
            const dotDistance = Math.sqrt(dotDx * dotDx + dotDy * dotDy);

            if (dotDistance < b2.radius + 5) { // Dots near other bubble
              const pushDirection = dotDistance > 0 ? { x: dotDx / dotDistance, y: dotDy / dotDistance } : { x: 1, y: 0 };
              dot.vx += pushDirection.x * collisionForce;
              dot.vy += pushDirection.y * collisionForce;
            }
          }
        });

        b2.dots.forEach(dot => {
          if (!dot.isExploding) {
            const dotDx = dot.x - b1.x;
            const dotDy = dot.y - b1.y;
            const dotDistance = Math.sqrt(dotDx * dotDx + dotDy * dotDy);

            if (dotDistance < b1.radius) { // Dots near other bubble
              const pushDirection = dotDistance > 0 ? { x: dotDx / dotDistance, y: dotDy / dotDistance } : { x: 1, y: 0 };
              dot.vx += pushDirection.x * collisionForce;
              dot.vy += pushDirection.y * collisionForce;
            }
          }
        });

        // Traditional bubble separation for actual overlap
        if (overlap > 0) {
          const separationX = (dx / distance) * overlap * 0.5;
          const separationY = (dy / distance) * overlap * 0.5;

          if (!b1.isDragging) {
            b1.x -= separationX;
            b1.y -= separationY;
          }
          if (!b2.isDragging) {
            b2.x += separationX;
            b2.y += separationY;
          }

          // Collision response
          const normalX = dx / distance;
          const normalY = dy / distance;

          const relativeVelocityX = b2.vx - b1.vx;
          const relativeVelocityY = b2.vy - b1.vy;
          const velocityInNormal = relativeVelocityX * normalX + relativeVelocityY * normalY;

          if (velocityInNormal < 0) { // Only if moving toward each other
            const restitution = 0.7; // Slightly softer bounce
            const impulse = 2 * velocityInNormal / 2;

            if (!b1.isDragging) {
              b1.vx += impulse * restitution * normalX;
              b1.vy += impulse * restitution * normalY;
            }
            if (!b2.isDragging) {
              b2.vx -= impulse * restitution * normalX;
              b2.vy -= impulse * restitution * normalY;
            }
          }
        }
      }
    }
  }
};

export const handleExplodingDotPhysics = (
  bubbles: Bubble[],
  canvas: HTMLCanvasElement,
  settings: BubbleSettings
) => {
  // Update exploding dots with physics that respect settings
  bubbles.forEach(bubble => {
    bubble.dots.forEach(dot => {
      if (dot.isExploding) {
        if (!dot.onGround) {
          // Apply physics while in air - respecting gravity setting
          dot.x += dot.explosionVx;
          dot.y += dot.explosionVy;
          dot.explosionVy += settings.gravity * 0.25; // Use actual gravity setting
          dot.explosionVx *= settings.airResistance; // Use air resistance setting

          // Boundary collisions for exploding dots - all walls
          const dotRadius = 5;

          // Left wall
          if (dot.x - dotRadius < 0) {
            dot.x = dotRadius;
            dot.explosionVx *= -settings.bounce * 0.8;
          }
          // Right wall
          if (dot.x + dotRadius > canvas.width) {
            dot.x = canvas.width - dotRadius;
            dot.explosionVx *= -settings.bounce * 0.8;
          }
          // Top wall
          if (dot.y - dotRadius < 0) {
            dot.y = dotRadius;
            dot.explosionVy *= -settings.bounce * 0.8;
          }
          // Bottom wall
          if (dot.y + dotRadius > canvas.height) {
            dot.y = canvas.height - dotRadius;
            if (settings.gravity > 0) {
              dot.onGround = true;
              dot.explosionVx *= settings.bounce * 0.7; // Friction
              dot.explosionVy = Math.abs(dot.explosionVy) * -settings.bounce * 0.3;
              dot.groundTime = 0;
            } else {
              // No gravity - just bounce off bottom
              dot.explosionVy *= -settings.bounce * 0.8;
            }
          }
        } else {
          // Dot is on ground
          dot.groundTime++;
          dot.explosionVx *= 0.95; // Friction on ground
          dot.x += dot.explosionVx;

          // Keep checking left/right boundaries even on ground
          const dotRadius = 5;
          if (dot.x - dotRadius < 0) {
            dot.x = dotRadius;
            dot.explosionVx *= -settings.bounce * 0.5;
          }
          if (dot.x + dotRadius > canvas.width) {
            dot.x = canvas.width - dotRadius;
            dot.explosionVx *= -settings.bounce * 0.5;
          }

          // Start fading after lingering on ground much longer
          if (dot.groundTime > 300) { // Linger for 300 frames (~5 seconds, was 60)
            dot.opacity -= 0.005; // Much slower fade (was 0.015)
          }
        }
      }
    });
  });
};

export const handleDotCollisions = (bubbles: Bubble[], settings: BubbleSettings) => {
  // Dot-to-bubble collisions (exploding dots bounce off bubbles)
  bubbles.forEach(bubble => {
    bubble.dots.forEach(explosionDot => {
      if (explosionDot.isExploding && !explosionDot.onGround) {
        // Check collisions with other bubbles
        bubbles.forEach(otherBubble => {
          if (otherBubble.id !== bubble.id) {
            const dx = explosionDot.x - otherBubble.x;
            const dy = explosionDot.y - otherBubble.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = 5 + otherBubble.radius; // dot radius + bubble radius

            if (distance < minDistance && distance > 0) {
              // Push dot away from bubble
              const overlap = minDistance - distance;
              const normalX = dx / distance;
              const normalY = dy / distance;

              // Move dot out of bubble
              explosionDot.x += normalX * overlap;
              explosionDot.y += normalY * overlap;

              // Bounce dot off bubble
              const dotSpeed = Math.sqrt(explosionDot.explosionVx ** 2 + explosionDot.explosionVy ** 2);
              explosionDot.explosionVx = normalX * dotSpeed * settings.bounce * 0.8;
              explosionDot.explosionVy = normalY * dotSpeed * settings.bounce * 0.8;

              // Push bubble away slightly (dots have some mass)
              if (!otherBubble.isDragging) {
                const pushForce = dotSpeed * 0.1;
                otherBubble.vx += normalX * pushForce;
                otherBubble.vy += normalY * pushForce;
              }
            }
          }
        });
      }
    });
  });

  // Dot-to-dot collisions (exploding dots bounce off each other)
  const allExplodingDots: { dot: BubbleDot; bubbleId: number }[] = [];
  bubbles.forEach(bubble => {
    bubble.dots.forEach(dot => {
      if (dot.isExploding) {
        allExplodingDots.push({ dot, bubbleId: bubble.id });
      }
    });
  });

  for (let i = 0; i < allExplodingDots.length; i++) {
    for (let j = i + 1; j < allExplodingDots.length; j++) {
      const dot1 = allExplodingDots[i].dot;
      const dot2 = allExplodingDots[j].dot;

      if (!dot1.onGround && !dot2.onGround) {
        const dx = dot2.x - dot1.x;
        const dy = dot2.y - dot1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = 10; // Two dot radii

        if (distance < minDistance && distance > 0) {
          // Separate dots
          const overlap = minDistance - distance;
          const normalX = dx / distance;
          const normalY = dy / distance;

          dot1.x -= normalX * overlap * 0.5;
          dot1.y -= normalY * overlap * 0.5;
          dot2.x += normalX * overlap * 0.5;
          dot2.y += normalY * overlap * 0.5;

          // Exchange velocities (elastic collision)
          const restitution = settings.bounce * 0.7;

          const relativeVx = dot2.explosionVx - dot1.explosionVx;
          const relativeVy = dot2.explosionVy - dot1.explosionVy;
          const velocityInNormal = relativeVx * normalX + relativeVy * normalY;

          if (velocityInNormal < 0) {
            const impulse = 2 * velocityInNormal * restitution;
            dot1.explosionVx += impulse * normalX * 0.5;
            dot1.explosionVy += impulse * normalY * 0.5;
            dot2.explosionVx -= impulse * normalX * 0.5;
            dot2.explosionVy -= impulse * normalY * 0.5;
          }
        }
      }
    }
  }
};