import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

export interface SpirographParams {
  R: number; // Outer circle radius
  r: number; // Inner circle radius
  d: number; // Pen offset distance
  cycles: number; // Number of pattern repetitions
  loops: number; // Total curve iterations
  speed: number; // Animation speed / line continuity
  xFactor: number; // Horizontal stretch
  yFactor: number; // Vertical stretch
  centerX: number; // X position
  centerY: number; // Y position
  rotation: number; // Rotation in degrees
  strokeColor: string; // Line color
  backgroundColor: string; // Background color
  strokeWidth: number; // Line thickness
}

interface SpirographCanvasProps {
  params: SpirographParams;
  isAnimating?: boolean;
  onAnimationComplete?: () => void;
  width?: number;
  height?: number;
}

export interface SpirographCanvasRef {
  exportAsSVG: () => string;
  exportAsPNG: () => string;
  exportAsGIF: () => Promise<void>;
  exportAsMP4: () => Promise<void>;
  getCanvas: () => HTMLCanvasElement | null;
}

export const SpirographCanvas = forwardRef<SpirographCanvasRef, SpirographCanvasProps>(({
  params,
  isAnimating = false,
  onAnimationComplete,
  width = 800,
  height = 600,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [animationProgress, setAnimationProgress] = useState(0);

  // Calculate spirograph points
  const calculateSpirograph = (t: number): { x: number; y: number } => {
    const { R, r, d, xFactor, yFactor, centerX, centerY, rotation } = params;
    
    // Hypotrochoid/Epitrochoid equations
    const x = (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t);
    const y = (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t);
    
    // Apply transformations
    const rotRad = (rotation * Math.PI) / 180;
    const rotatedX = x * Math.cos(rotRad) - y * Math.sin(rotRad);
    const rotatedY = x * Math.sin(rotRad) + y * Math.cos(rotRad);
    
    return {
      x: rotatedX * xFactor + centerX,
      y: rotatedY * yFactor + centerY,
    };
  };

  // Get all points for the complete spirograph
  const getAllPoints = () => {
    const points: { x: number; y: number }[] = [];
    const totalSteps = params.loops * params.cycles;
    const stepSize = (2 * Math.PI * params.cycles) / totalSteps;
    
    for (let i = 0; i <= totalSteps; i++) {
      const t = i * stepSize;
      points.push(calculateSpirograph(t));
    }
    
    return points;
  };

  // Draw the spirograph
  const draw = (ctx: CanvasRenderingContext2D, animatedPointCount?: number) => {
    const { backgroundColor, strokeColor, strokeWidth } = params;
    
    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    
    const points = getAllPoints();
    if (points.length === 0) return;
    
    const pointsToDraw = animatedPointCount ? points.slice(0, animatedPointCount) : points;
    
    if (pointsToDraw.length < 2) return;
    
    // Set up drawing style
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Draw the curve
    ctx.beginPath();
    const firstPoint = pointsToDraw[0];
    ctx.moveTo(firstPoint.x, firstPoint.y);
    
    for (let i = 1; i < pointsToDraw.length; i++) {
      const point = pointsToDraw[i];
      ctx.lineTo(point.x, point.y);
    }
    
    ctx.stroke();
  };

  // Export functions
  const exportAsSVG = () => {
    const points = getAllPoints();
    if (points.length === 0) return '';
    
    const { strokeColor, strokeWidth, backgroundColor } = params;
    
    let pathData = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathData += ` L ${points[i].x} ${points[i].y}`;
    }
    
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${backgroundColor}"/>
      <path d="${pathData}" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  };

  const exportAsPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    
    return canvas.toDataURL('image/png');
  };

  // Create a GIF using canvas frames
  const exportAsGIF = async () => {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error('Canvas not available');

    // We'll create a simple frame-based GIF export
    // Note: This is a simplified implementation
    const frames: string[] = [];
    const totalSteps = params.loops * params.cycles;
    const frameCount = Math.min(60, Math.floor(totalSteps / params.speed)); // Limit to 60 frames
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) throw new Error('Could not create temp canvas context');

    // Generate frames
    for (let frame = 0; frame <= frameCount; frame++) {
      const progress = frame / frameCount;
      const pointCount = Math.floor(progress * totalSteps);
      
      draw(tempCtx, pointCount);
      frames.push(tempCanvas.toDataURL('image/png'));
    }

    // Create a simple animated sequence (this would typically use a GIF encoder library)
    // For now, we'll download the final frame as a fallback
    const link = document.createElement('a');
    link.href = frames[frames.length - 1];
    link.download = 'spirograph-animation.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Create an MP4 using MediaRecorder (simplified implementation)
  const exportAsMP4 = async () => {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error('Canvas not available');

    try {
      const stream = canvas.captureStream(30); // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp9'
      });

      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'spirograph-animation.webm';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      };

      mediaRecorder.start();
      
      // Record for animation duration (simplified)
      setTimeout(() => {
        mediaRecorder.stop();
      }, 5000); // 5 second recording

    } catch (error) {
      // Fallback to PNG if video recording is not supported
      const pngData = exportAsPNG();
      const link = document.createElement('a');
      link.href = pngData;
      link.download = 'spirograph-static.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    exportAsSVG,
    exportAsPNG,
    exportAsGIF,
    exportAsMP4,
    getCanvas: () => canvasRef.current,
  }));

  // Animation loop
  useEffect(() => {
    if (!isAnimating) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const totalPoints = params.loops * params.cycles;
    let currentFrame = 0;
    
    const animate = () => {
      const progress = currentFrame / totalPoints;
      const pointCount = Math.floor(progress * totalPoints);
      
      draw(ctx, pointCount);
      setAnimationProgress(progress);
      
      if (currentFrame < totalPoints) {
        currentFrame += params.speed;
        animationRef.current = requestAnimationFrame(animate);
      } else {
        onAnimationComplete?.();
        setAnimationProgress(1);
      }
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, params]);

  // Static draw when not animating
  useEffect(() => {
    if (isAnimating) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    draw(ctx);
  }, [params, isAnimating]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-border rounded-lg shadow-lg bg-card"
      />
      {isAnimating && (
        <div className="absolute bottom-2 left-2 bg-card/80 backdrop-blur-sm px-2 py-1 rounded text-sm">
          {Math.round(animationProgress * 100)}%
        </div>
      )}
    </div>
  );
});

SpirographCanvas.displayName = 'SpirographCanvas';