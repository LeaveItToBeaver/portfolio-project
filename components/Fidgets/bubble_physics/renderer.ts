import { Bubble } from './types';

export const draw = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  bubbles: Bubble[]
) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw bubbles as large dots
  bubbles.forEach(bubble => {
    // Draw each dot that makes up the bubble
    bubble.dots.forEach(dot => {
      if (dot.opacity <= 0) return;

      ctx.save();
      ctx.globalAlpha = dot.opacity;

      // Use bubble color for dots
      ctx.fillStyle = bubble.color;

      // Draw smaller, more numerous dots
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, 5, 0, Math.PI * 2); // Smaller 5px radius dots
      ctx.fill();

      // Add slight glow for dragged bubbles
      if (bubble.isDragging && !dot.isExploding) {
        ctx.shadowColor = bubble.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    });
  });
};

export const animate = (
  updateCallback: () => void,
  drawCallback: () => void,
  animationRef: React.MutableRefObject<number>
) => {
  const animateFrame = () => {
    updateCallback();
    drawCallback();
    animationRef.current = requestAnimationFrame(animateFrame);
  };
  
  return animateFrame;
};