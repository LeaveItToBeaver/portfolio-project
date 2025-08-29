export interface Point {
  x: number;
  y: number;
}

export interface Vector {
  x: number;
  y: number;
}

export interface BezierTrail {
  points: Point[];
  controlPoints: Point[];
  life: number;
}

export interface BounceBall {
  id: string;
  position: Point;
  velocity: Vector;
  radius: number;
  color: string;
  isDragging: boolean;
  dragOffset?: Point;
}

export class MousePhysics {
  static calculateBezierPoint(t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point {
    const oneMinusT = 1 - t;
    const oneMinusTSquared = oneMinusT * oneMinusT;
    const oneMinusTCubed = oneMinusTSquared * oneMinusT;
    const tSquared = t * t;
    const tCubed = tSquared * t;

    return {
      x: oneMinusTCubed * p0.x + 3 * oneMinusTSquared * t * p1.x + 3 * oneMinusT * tSquared * p2.x + tCubed * p3.x,
      y: oneMinusTCubed * p0.y + 3 * oneMinusTSquared * t * p1.y + 3 * oneMinusT * tSquared * p2.y + tCubed * p3.y
    };
  }

  static generateGooeyBezierTrail(points: Point[], tension: number = 0.5): string {
    if (points.length < 2) return '';

    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const current = points[i];
      const previous = points[i - 1];
      
      // Calculate control points for gooey effect
      const distance = Math.sqrt(Math.pow(current.x - previous.x, 2) + Math.pow(current.y - previous.y, 2));
      const controlOffset = Math.min(distance * tension, 50);
      
      const cp1x = previous.x + (current.x - previous.x) * 0.33 + Math.sin(i * 0.5) * controlOffset * 0.5;
      const cp1y = previous.y + (current.y - previous.y) * 0.33 + Math.cos(i * 0.5) * controlOffset * 0.5;
      
      const cp2x = previous.x + (current.x - previous.x) * 0.66 + Math.sin(i * 0.7) * controlOffset * 0.3;
      const cp2y = previous.y + (current.y - previous.y) * 0.66 + Math.cos(i * 0.7) * controlOffset * 0.3;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${current.x} ${current.y}`;
    }
    
    return path;
  }

  static updateBallPhysics(ball: BounceBall, bounds: { width: number; height: number }, deltaTime: number = 16): BounceBall {
    if (ball.isDragging) {
      // Don't apply physics when being dragged
      ball.velocity = { x: 0, y: 0 };
      return ball;
    }

    const friction = 0.995;
    const bounceDamping = 0.8;
    const timeScale = deltaTime / 16;
    
    // Update position
    ball.position.x += ball.velocity.x * timeScale;
    ball.position.y += ball.velocity.y * timeScale;
    
    // Bounce off walls
    if (ball.position.x - ball.radius <= 0) {
      ball.velocity.x = Math.abs(ball.velocity.x) * bounceDamping;
      ball.position.x = ball.radius;
    }
    if (ball.position.x + ball.radius >= bounds.width) {
      ball.velocity.x = -Math.abs(ball.velocity.x) * bounceDamping;
      ball.position.x = bounds.width - ball.radius;
    }
    
    if (ball.position.y - ball.radius <= 0) {
      ball.velocity.y = Math.abs(ball.velocity.y) * bounceDamping;
      ball.position.y = ball.radius;
    }
    if (ball.position.y + ball.radius >= bounds.height) {
      ball.velocity.y = -Math.abs(ball.velocity.y) * bounceDamping;
      ball.position.y = bounds.height - ball.radius;
    }
    
    // Apply friction
    ball.velocity.x *= friction;
    ball.velocity.y *= friction;
    
    return ball;
  }

  static checkBallCollision(ball1: BounceBall, ball2: BounceBall): boolean {
    const dx = ball2.position.x - ball1.position.x;
    const dy = ball2.position.y - ball1.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (ball1.radius + ball2.radius);
  }

  static resolveBallCollision(ball1: BounceBall, ball2: BounceBall): void {
    if (ball1.isDragging || ball2.isDragging) return;

    const dx = ball2.position.x - ball1.position.x;
    const dy = ball2.position.y - ball1.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = ball1.radius + ball2.radius;
    
    if (distance < minDistance && distance > 0) {
      // Normalize collision vector
      const nx = dx / distance;
      const ny = dy / distance;
      
      // Separate balls
      const overlap = minDistance - distance;
      const separationX = (overlap / 2) * nx;
      const separationY = (overlap / 2) * ny;
      
      ball1.position.x -= separationX;
      ball1.position.y -= separationY;
      ball2.position.x += separationX;
      ball2.position.y += separationY;
      
      // Calculate collision response
      const relativeVelocityX = ball2.velocity.x - ball1.velocity.x;
      const relativeVelocityY = ball2.velocity.y - ball1.velocity.y;
      const speed = relativeVelocityX * nx + relativeVelocityY * ny;
      
      if (speed > 0) return; // Balls moving apart
      
      // Elastic collision (assuming equal mass)
      const restitution = 0.8;
      const impulse = speed * restitution;
      
      ball1.velocity.x += impulse * nx;
      ball1.velocity.y += impulse * ny;
      ball2.velocity.x -= impulse * nx;
      ball2.velocity.y -= impulse * ny;
    }
  }

  static isPointInBall(point: Point, ball: BounceBall): boolean {
    const distance = this.distance(point, ball.position);
    return distance <= ball.radius;
  }

  static calculateMouseVelocity(current: Point, previous: Point, deltaTime: number): Vector {
    const dx = current.x - previous.x;
    const dy = current.y - previous.y;
    return {
      x: dx / deltaTime,
      y: dy / deltaTime
    };
  }

  static isMouseInBounds(mouse: Point, bounds: { width: number; height: number }): boolean {
    return mouse.x >= 0 && mouse.x <= bounds.width && mouse.y >= 0 && mouse.y <= bounds.height;
  }

  static constrainMouseToBounds(mouse: Point, bounds: { width: number; height: number }): Point {
    return {
      x: Math.max(0, Math.min(bounds.width, mouse.x)),
      y: Math.max(0, Math.min(bounds.height, mouse.y))
    };
  }

  static distance(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }
}