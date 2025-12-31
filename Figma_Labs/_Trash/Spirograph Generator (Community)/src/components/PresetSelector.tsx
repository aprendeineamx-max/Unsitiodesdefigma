import React, { useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { SpirographParams } from './SpirographCanvas';

interface PresetSelectorProps {
  onPresetSelect: (params: SpirographParams) => void;
  currentParams: SpirographParams;
}

// Component for rendering a small preview of a spirograph
const PresetPreview: React.FC<{ params: SpirographParams; name: string }> = ({ params, name }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set background
    ctx.fillStyle = params.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Scale parameters for preview
    const scale = 0.3; // Slightly bigger scale for wider preview
    const scaledR = params.R * scale;
    const scaledR_inner = params.r * scale;
    const scaledD = params.d * scale;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw a simplified version with fewer loops
    const maxLoops = Math.min(400, params.loops * 0.35); // More loops for better preview
    
    ctx.strokeStyle = params.strokeColor;
    ctx.lineWidth = Math.max(0.8, params.strokeWidth * 0.8);
    ctx.beginPath();

    let firstPoint = true;
    for (let i = 0; i <= maxLoops; i++) {
      const t = (i / maxLoops) * params.cycles * 2 * Math.PI;
      
      const x = (scaledR - scaledR_inner) * Math.cos(t) + 
                scaledD * Math.cos(((scaledR - scaledR_inner) / scaledR_inner) * t);
      const y = (scaledR - scaledR_inner) * Math.sin(t) - 
                scaledD * Math.sin(((scaledR - scaledR_inner) / scaledR_inner) * t);

      // Apply transformations
      const finalX = centerX + x * params.xFactor * Math.cos(params.rotation * Math.PI / 180) - 
                     y * params.yFactor * Math.sin(params.rotation * Math.PI / 180);
      const finalY = centerY + x * params.xFactor * Math.sin(params.rotation * Math.PI / 180) + 
                     y * params.yFactor * Math.cos(params.rotation * Math.PI / 180);

      if (firstPoint) {
        ctx.moveTo(finalX, finalY);
        firstPoint = false;
      } else {
        ctx.lineTo(finalX, finalY);
      }
    }
    
    ctx.stroke();
  }, [params]);

  return (
    <canvas
      ref={canvasRef}
      width={160}
      height={100}
      className="w-40 h-[100px] rounded border"
    />
  );
};

export const spirographPresets: Record<string, SpirographParams> = {
  // Classic symmetric patterns
  'Rose': {
    R: 120,
    r: 30,
    d: 80,
    cycles: 8,
    loops: 1000,
    speed: 5,
    xFactor: 1,
    yFactor: 1,
    centerX: 400,
    centerY: 300,
    rotation: 0,
    strokeColor: '#ff006e',
    backgroundColor: '#000000',
    strokeWidth: 2,
  },
  
  // Dense intricate pattern
  'Web': {
    R: 160,
    r: 13,
    d: 85,
    cycles: 24,
    loops: 4000,
    speed: 8,
    xFactor: 1,
    yFactor: 1,
    centerX: 400,
    centerY: 300,
    rotation: 0,
    strokeColor: '#9d4edd',
    backgroundColor: '#0a0a0a',
    strokeWidth: 0.8,
  },

  // Elongated distorted pattern
  'Cosmic': {
    R: 90,
    r: 45,
    d: 120,
    cycles: 6,
    loops: 800,
    speed: 4,
    xFactor: 2.2,
    yFactor: 0.6,
    centerX: 400,
    centerY: 300,
    rotation: 45,
    strokeColor: '#06ffa5',
    backgroundColor: '#001122',
    strokeWidth: 2.5,
  },

  // Tight inner loops
  'Quantum': {
    R: 75,
    r: 65,
    d: 25,
    cycles: 12,
    loops: 2500,
    speed: 12,
    xFactor: 1,
    yFactor: 1,
    centerX: 400,
    centerY: 300,
    rotation: 0,
    strokeColor: '#00b4d8',
    backgroundColor: '#03045e',
    strokeWidth: 1.5,
  },

  // Large sweeping arcs
  'Solar': {
    R: 180,
    r: 25,
    d: 170,
    cycles: 7,
    loops: 1500,
    speed: 6,
    xFactor: 1.1,
    yFactor: 0.9,
    centerX: 400,
    centerY: 300,
    rotation: 30,
    strokeColor: '#ff9500',
    backgroundColor: '#1a1a1a',
    strokeWidth: 3,
  },

  // Irregular mathematical ratio
  'Fibonacci': {
    R: 110,
    r: 68,
    d: 89,
    cycles: 13,
    loops: 2100,
    speed: 5,
    xFactor: 1.618,
    yFactor: 0.618,
    centerX: 400,
    centerY: 300,
    rotation: 137.5,
    strokeColor: '#f72585',
    backgroundColor: '#fefae0',
    strokeWidth: 2,
  },

  // High frequency vibration
  'Neural': {
    R: 95,
    r: 17,
    d: 55,
    cycles: 31,
    loops: 5000,
    speed: 15,
    xFactor: 1,
    yFactor: 1,
    centerX: 400,
    centerY: 300,
    rotation: 0,
    strokeColor: '#7209b7',
    backgroundColor: '#f8f9fa',
    strokeWidth: 1,
  },

  // Extreme distortion
  'Rift': {
    R: 140,
    r: 35,
    d: 95,
    cycles: 9,
    loops: 1800,
    speed: 7,
    xFactor: 0.3,
    yFactor: 3.2,
    centerX: 400,
    centerY: 300,
    rotation: 90,
    strokeColor: '#e63946',
    backgroundColor: '#212529',
    strokeWidth: 2.5,
  },

  // DYNAMIC ENERGETIC PATTERN - REPLACED ZEN
  'Pulse': {
    R: 165,
    r: 27,
    d: 145,
    cycles: 23,
    loops: 4600,
    speed: 20,
    xFactor: 1.4,
    yFactor: 0.7,
    centerX: 400,
    centerY: 300,
    rotation: 127,
    strokeColor: '#00f5ff',
    backgroundColor: '#0d0015',
    strokeWidth: 1.3,
  },

  // Complex multi-layered
  'Galaxy': {
    R: 150,
    r: 47,
    d: 130,
    cycles: 19,
    loops: 3800,
    speed: 9,
    xFactor: 1.3,
    yFactor: 0.8,
    centerX: 400,
    centerY: 300,
    rotation: 15,
    strokeColor: '#ffd60a',
    backgroundColor: '#003566',
    strokeWidth: 1.2,
  },

  // Organic flowing pattern
  'Ocean': {
    R: 125,
    r: 85,
    d: 160,
    cycles: 5,
    loops: 1000,
    speed: 4,
    xFactor: 1.8,
    yFactor: 1.4,
    centerX: 400,
    centerY: 300,
    rotation: 60,
    strokeColor: '#0077be',
    backgroundColor: '#caf0f8',
    strokeWidth: 3.5,
  },

  // Sharp geometric
  'Crystal': {
    R: 85,
    r: 21,
    d: 42,
    cycles: 16,
    loops: 3200,
    speed: 11,
    xFactor: 1,
    yFactor: 1,
    centerX: 400,
    centerY: 300,
    rotation: 22.5,
    strokeColor: '#c77dff',
    backgroundColor: '#0d1117',
    strokeWidth: 1.5,
  },

  // NEW PRESETS

  // Chaotic turbulent pattern
  'Storm': {
    R: 135,
    r: 11,
    d: 67,
    cycles: 37,
    loops: 6000,
    speed: 18,
    xFactor: 1.1,
    yFactor: 0.9,
    centerX: 400,
    centerY: 300,
    rotation: 73,
    strokeColor: '#4cc9f0',
    backgroundColor: '#161a1d',
    strokeWidth: 0.9,
  },

  // Organic petal-like pattern
  'Lotus': {
    R: 105,
    r: 42,
    d: 135,
    cycles: 5,
    loops: 1250,
    speed: 3.5,
    xFactor: 1,
    yFactor: 1,
    centerX: 400,
    centerY: 300,
    rotation: 0,
    strokeColor: '#d62d20',
    backgroundColor: '#fff8e7',
    strokeWidth: 3.2,
  },

  // Hypnotic swirling pattern
  'Vortex': {
    R: 115,
    r: 71,
    d: 190,
    cycles: 4,
    loops: 1600,
    speed: 6.5,
    xFactor: 0.7,
    yFactor: 1.9,
    centerX: 400,
    centerY: 300,
    rotation: 45,
    strokeColor: '#8338ec',
    backgroundColor: '#0f0f23',
    strokeWidth: 2.8,
  },
};

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  onPresetSelect,
  currentParams,
}) => {
  const presetNames = Object.keys(spirographPresets);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {presetNames.map((presetName) => (
          <Button
            key={presetName}
            variant="outline"
            onClick={() => onPresetSelect(spirographPresets[presetName])}
            className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-accent transition-colors"
          >
            <PresetPreview 
              params={spirographPresets[presetName]} 
              name={presetName}
            />
            <span className="text-sm font-medium text-center leading-tight">
              {presetName}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};