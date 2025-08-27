'use client';
import { useRef, useEffect, useState, useCallback } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Cube {
  center: Point3D;
  rotation: Point3D;
  rotationSpeed: Point3D;
  size: number;
  color: string;
}

export default function Space3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const cubesRef = useRef<Cube[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, isDown: false });
  const cameraRef = useRef({ rotationX: 0, rotationY: 0, distance: 300 });
  const lastMouseRef = useRef({ x: 0, y: 0 });
  
  const [settings, setSettings] = useState({
    cubeCount: 6,
    rotationSpeed: 1,
    perspective: 500,
    autoRotate: true
  });

  const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6', '#f97316'];

  const createCube = useCallback((): Cube => {
    return {
      center: {
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200,
        z: (Math.random() - 0.5) * 200
      },
      rotation: {
        x: Math.random() * Math.PI * 2,
        y: Math.random() * Math.PI * 2,
        z: Math.random() * Math.PI * 2
      },
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02
      },
      size: Math.random() * 30 + 20,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
  }, []);

  const initCubes = useCallback(() => {
    cubesRef.current = Array.from({ length: settings.cubeCount }, () => createCube());
  }, [settings.cubeCount, createCube]);

  const project3D = useCallback((point: Point3D, canvas: HTMLCanvasElement): { x: number; y: number; scale: number } => {
    // Apply camera rotation
    const cosX = Math.cos(cameraRef.current.rotationX);
    const sinX = Math.sin(cameraRef.current.rotationX);
    const cosY = Math.cos(cameraRef.current.rotationY);
    const sinY = Math.sin(cameraRef.current.rotationY);
    
    // Rotate around Y axis
    let rotatedX = point.x * cosY - point.z * sinY;
    let rotatedZ = point.x * sinY + point.z * cosY;
    let rotatedY = point.y;
    
    // Rotate around X axis
    let finalX = rotatedX;
    let finalY = rotatedY * cosX - rotatedZ * sinX;
    let finalZ = rotatedY * sinX + rotatedZ * cosX;
    
    // Apply perspective
    finalZ += cameraRef.current.distance;
    const scale = settings.perspective / (settings.perspective + finalZ);
    
    return {
      x: canvas.width / 2 + finalX * scale,
      y: canvas.height / 2 + finalY * scale,
      scale: scale
    };
  }, [settings.perspective]);

  const drawCube = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, cube: Cube) => {
    const size = cube.size;
    
    // Define cube vertices
    const vertices: Point3D[] = [
      { x: -size/2, y: -size/2, z: -size/2 },
      { x: size/2, y: -size/2, z: -size/2 },
      { x: size/2, y: size/2, z: -size/2 },
      { x: -size/2, y: size/2, z: -size/2 },
      { x: -size/2, y: -size/2, z: size/2 },
      { x: size/2, y: -size/2, z: size/2 },
      { x: size/2, y: size/2, z: size/2 },
      { x: -size/2, y: size/2, z: size/2 }
    ];
    
    // Apply cube rotation
    const cosX = Math.cos(cube.rotation.x);
    const sinX = Math.sin(cube.rotation.x);
    const cosY = Math.cos(cube.rotation.y);
    const sinY = Math.sin(cube.rotation.y);
    const cosZ = Math.cos(cube.rotation.z);
    const sinZ = Math.sin(cube.rotation.z);
    
    const rotatedVertices = vertices.map(vertex => {
      // Rotate around X axis
      let rotX = vertex.x;
      let rotY = vertex.y * cosX - vertex.z * sinX;
      let rotZ = vertex.y * sinX + vertex.z * cosX;
      
      // Rotate around Y axis
      let rotX2 = rotX * cosY - rotZ * sinY;
      let rotY2 = rotY;
      let rotZ2 = rotX * sinY + rotZ * cosY;
      
      // Rotate around Z axis
      let rotX3 = rotX2 * cosZ - rotY2 * sinZ;
      let rotY3 = rotX2 * sinZ + rotY2 * cosZ;
      let rotZ3 = rotZ2;
      
      // Translate to cube center
      return {
        x: rotX3 + cube.center.x,
        y: rotY3 + cube.center.y,
        z: rotZ3 + cube.center.z
      };
    });
    
    // Project vertices to 2D
    const projectedVertices = rotatedVertices.map(vertex => project3D(vertex, canvas));
    
    // Define cube faces
    const faces = [
      [0, 1, 2, 3], // back
      [4, 7, 6, 5], // front
      [0, 4, 5, 1], // bottom
      [2, 6, 7, 3], // top
      [0, 3, 7, 4], // left
      [1, 5, 6, 2]  // right
    ];
    
    // Calculate face centers for depth sorting
    const facesWithDepth = faces.map(face => {
      const centerZ = face.reduce((sum, vertexIndex) => sum + rotatedVertices[vertexIndex].z, 0) / 4;
      return { face, depth: centerZ };
    });
    
    // Sort faces by depth (back to front)
    facesWithDepth.sort((a, b) => a.depth - b.depth);
    
    // Draw faces
    facesWithDepth.forEach(({ face }, faceIndex) => {
      ctx.beginPath();
      ctx.moveTo(projectedVertices[face[0]].x, projectedVertices[face[0]].y);
      
      for (let i = 1; i < face.length; i++) {
        ctx.lineTo(projectedVertices[face[i]].x, projectedVertices[face[i]].y);
      }
      
      ctx.closePath();
      
      // Calculate lighting based on face normal and depth
      const alpha = Math.max(0.1, 0.8 - faceIndex * 0.1);
      const scale = projectedVertices[face[0]].scale;
      
      ctx.fillStyle = cube.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.fill();
      
      ctx.strokeStyle = cube.color;
      ctx.lineWidth = Math.max(0.5, scale * 2);
      ctx.stroke();
    });
  }, [project3D]);

  const updateCubes = useCallback(() => {
    cubesRef.current.forEach(cube => {
      if (settings.autoRotate) {
        cube.rotation.x += cube.rotationSpeed.x * settings.rotationSpeed;
        cube.rotation.y += cube.rotationSpeed.y * settings.rotationSpeed;
        cube.rotation.z += cube.rotationSpeed.z * settings.rotationSpeed;
      }
    });
  }, [settings.autoRotate, settings.rotationSpeed]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear with slight fade for trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Sort cubes by distance for proper depth rendering
    const sortedCubes = [...cubesRef.current].sort((a, b) => {
      const distA = Math.sqrt(a.center.x * a.center.x + a.center.y * a.center.y + a.center.z * a.center.z);
      const distB = Math.sqrt(b.center.x * b.center.x + b.center.y * b.center.y + b.center.z * b.center.z);
      return distB - distA;
    });
    
    // Draw cubes
    sortedCubes.forEach(cube => {
      drawCube(ctx, canvas, cube);
    });
    
    // Draw coordinate system
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    
    const origin = project3D({ x: 0, y: 0, z: 0 }, canvas);
    const xAxis = project3D({ x: 100, y: 0, z: 0 }, canvas);
    const yAxis = project3D({ x: 0, y: 100, z: 0 }, canvas);
    const zAxis = project3D({ x: 0, y: 0, z: 100 }, canvas);
    
    // X axis (red)
    ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)';
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(xAxis.x, xAxis.y);
    ctx.stroke();
    
    // Y axis (green)
    ctx.strokeStyle = 'rgba(100, 255, 100, 0.5)';
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(yAxis.x, yAxis.y);
    ctx.stroke();
    
    // Z axis (blue)
    ctx.strokeStyle = 'rgba(100, 100, 255, 0.5)';
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(zAxis.x, zAxis.y);
    ctx.stroke();
  }, [drawCube, project3D]);

  const animate = useCallback(() => {
    updateCubes();
    draw();
    animationRef.current = requestAnimationFrame(animate);
  }, [updateCubes, draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initCubes();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      
      if (mouseRef.current.isDown) {
        const deltaX = mouseRef.current.x - lastMouseRef.current.x;
        const deltaY = mouseRef.current.y - lastMouseRef.current.y;
        
        cameraRef.current.rotationY += deltaX * 0.01;
        cameraRef.current.rotationX += deltaY * 0.01;
        
        // Clamp X rotation to prevent flipping
        cameraRef.current.rotationX = Math.max(-Math.PI/2, Math.min(Math.PI/2, cameraRef.current.rotationX));
      }
      
      lastMouseRef.current = { x: mouseRef.current.x, y: mouseRef.current.y };
    };

    const handleMouseDown = () => {
      mouseRef.current.isDown = true;
    };

    const handleMouseUp = () => {
      mouseRef.current.isDown = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraRef.current.distance += e.deltaY * 0.5;
      cameraRef.current.distance = Math.max(100, Math.min(800, cameraRef.current.distance));
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      cancelAnimationFrame(animationRef.current);
    };
  }, [animate, initCubes]);

  return (
    <div className="w-full h-full min-h-[400px] bg-card rounded-2xl border p-4">
      <div className="mb-4 space-y-3">
        <h3 className="text-lg font-semibold">3D Space</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block text-muted-foreground mb-1">Cubes: {settings.cubeCount}</label>
            <input
              type="range"
              min="3"
              max="12"
              value={settings.cubeCount}
              onChange={(e) => setSettings(s => ({ ...s, cubeCount: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-muted-foreground mb-1">Speed: {settings.rotationSpeed.toFixed(1)}</label>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={settings.rotationSpeed}
              onChange={(e) => setSettings(s => ({ ...s, rotationSpeed: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-muted-foreground mb-1">Perspective: {settings.perspective}</label>
            <input
              type="range"
              min="200"
              max="1000"
              step="50"
              value={settings.perspective}
              onChange={(e) => setSettings(s => ({ ...s, perspective: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoRotate"
              checked={settings.autoRotate}
              onChange={(e) => setSettings(s => ({ ...s, autoRotate: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="autoRotate" className="text-muted-foreground">Auto Rotate</label>
          </div>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-64 rounded-xl bg-background cursor-grab active:cursor-grabbing border"
      />
      <p className="text-xs text-muted-foreground mt-2">Click and drag to rotate • Scroll to zoom • Red=X, Green=Y, Blue=Z</p>
    </div>
  );
}