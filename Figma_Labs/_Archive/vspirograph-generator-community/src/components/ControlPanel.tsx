import React from 'react';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ColorPicker } from './ui/color-picker';
import { Shuffle } from 'lucide-react';
import { SpirographParams } from './SpirographCanvas';

interface ControlPanelProps {
  params: SpirographParams;
  onChange: (params: SpirographParams) => void;
}

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  unit?: string;
}

const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit = '',
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className="w-14 h-6 text-xs text-right px-2"
            min={min}
            max={max}
            step={step}
          />
          {unit && <span className="text-[10px] text-muted-foreground/70 w-4">{unit}</span>}
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={([newValue]) => onChange(newValue)}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  );
};

export const ControlPanel: React.FC<ControlPanelProps> = ({ params, onChange }) => {
  const updateParam = (key: keyof SpirographParams, value: any) => {
    onChange({ ...params, [key]: value });
  };

  const generateRandomColors = () => {
    // Helper function to generate random integer between min and max
    const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    
    // Generate random color using HSL for better color distribution
    const generateRandomColor = () => {
      const hue = randomInt(0, 360);
      const saturation = randomInt(60, 100); // Keep saturation high for vibrant colors
      const lightness = randomInt(40, 70); // Medium lightness for good contrast
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };

    // Generate background color (darker for contrast)
    const generateBackgroundColor = () => {
      if (Math.random() > 0.7) {
        // 30% chance for a colored background
        const hue = randomInt(0, 360);
        const saturation = randomInt(20, 50);
        const lightness = randomInt(5, 20);
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      } else {
        // 70% chance for black or very dark background
        return Math.random() > 0.5 ? '#000000' : '#0a0a0a';
      }
    };

    onChange({
      ...params,
      strokeColor: generateRandomColor(),
      backgroundColor: generateBackgroundColor(),
    });
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Shape */}
      <div>
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3 px-1">Shape</h3>
        <Card className="p-3">
          <div className="space-y-3">
            <SliderControl
              label="Outer radius"
              value={params.R}
              min={10}
              max={200}
              step={1}
              onChange={(value) => updateParam('R', value)}
            />
            <SliderControl
              label="Inner radius"
              value={params.r}
              min={1}
              max={150}
              step={1}
              onChange={(value) => updateParam('r', value)}
            />
            <SliderControl
              label="Pen distance"
              value={params.d}
              min={1}
              max={200}
              step={1}
              onChange={(value) => updateParam('d', value)}
            />
          </div>
        </Card>
      </div>

      {/* Animation */}
      <div>
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3 px-1">Animation</h3>
        <Card className="p-3">
          <div className="space-y-3">
            <SliderControl
              label="Cycles"
              value={params.cycles}
              min={1}
              max={20}
              step={1}
              onChange={(value) => updateParam('cycles', value)}
            />
            <SliderControl
              label="Detail"
              value={params.loops}
              min={100}
              max={5000}
              step={50}
              onChange={(value) => updateParam('loops', value)}
            />
            <SliderControl
              label="Speed"
              value={params.speed}
              min={1}
              max={50}
              step={1}
              onChange={(value) => updateParam('speed', value)}
            />
          </div>
        </Card>
      </div>

      {/* Transform */}
      <div>
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3 px-1">Transform</h3>
        <Card className="p-3">
          <div className="space-y-3">
            <SliderControl
              label="Stretch X"
              value={params.xFactor}
              min={0.1}
              max={3}
              step={0.1}
              onChange={(value) => updateParam('xFactor', value)}
            />
            <SliderControl
              label="Stretch Y"
              value={params.yFactor}
              min={0.1}
              max={3}
              step={0.1}
              onChange={(value) => updateParam('yFactor', value)}
            />
            <SliderControl
              label="Position X"
              value={params.centerX}
              min={50}
              max={750}
              step={10}
              onChange={(value) => updateParam('centerX', value)}
            />
            <SliderControl
              label="Position Y"
              value={params.centerY}
              min={50}
              max={550}
              step={10}
              onChange={(value) => updateParam('centerY', value)}
            />
            <SliderControl
              label="Rotation"
              value={params.rotation}
              min={0}
              max={360}
              step={1}
              onChange={(value) => updateParam('rotation', value)}
              unit="°"
            />
          </div>
        </Card>
      </div>

      {/* Style */}
      <div>
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3 px-1">Style</h3>
        <Card className="p-3">
          <div className="space-y-3">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <ColorPicker
                  label="Line color"
                  value={params.strokeColor}
                  onChange={(value) => updateParam('strokeColor', value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={generateRandomColors}
                className="h-8 px-2"
                title="Random colors"
              >
                <Shuffle className="h-3 w-3" />
              </Button>
            </div>
            <ColorPicker
              label="Background"
              value={params.backgroundColor}
              onChange={(value) => updateParam('backgroundColor', value)}
            />
            <SliderControl
              label="Line width"
              value={params.strokeWidth}
              min={0.5}
              max={10}
              step={0.5}
              onChange={(value) => updateParam('strokeWidth', value)}
              unit="px"
            />
          </div>
        </Card>
      </div>
    </div>
  );
};