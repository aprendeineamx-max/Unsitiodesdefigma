import React, { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Card } from './card';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  presets?: string[];
}

const defaultPresets = [
  '#ff006e', '#8338ec', '#3a86ff', '#06ffa5', '#ffbe0b', '#ff4081',
  '#e91e63', '#9c27b0', '#673ab7', '#2196f3', '#00bcd4', '#009688',
  '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
  '#ff5722', '#795548', '#607d8b', '#ffffff', '#9e9e9e', '#000000'
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  label,
  presets = defaultPresets
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleColorChange = (color: string) => {
    onChange(color);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2 relative">
      {label && <Label className="text-xs text-muted-foreground">{label}</Label>}
      <div className="relative">
        <Button
          variant="outline"
          className="w-full h-8 p-0 border-2 hover:border-foreground/20 transition-colors justify-start"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2 px-3 w-full">
            <div
              className="w-4 h-4 rounded-full border border-border/50 flex-shrink-0"
              style={{ backgroundColor: value }}
            />
            <span className="text-xs font-mono flex-1 text-left">{value}</span>
          </div>
        </Button>
        
        {isOpen && (
          <Card className="absolute top-full left-0 mt-1 w-64 p-3 z-50 shadow-lg border">
            <div className="space-y-3">
              {/* Native color picker */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Custom Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-8 h-8 rounded border-2 border-border cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={value}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="flex-1 h-8 text-xs font-mono"
                    placeholder="#000000"
                  />
                </div>
              </div>

              {/* Color presets */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Presets</Label>
                <div className="grid grid-cols-8 gap-1">
                  {presets.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => handleColorChange(color)}
                      className="w-6 h-6 rounded border border-border/50 hover:border-foreground/30 transition-colors hover:scale-110 transform duration-150"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
      
      {/* Backdrop to close the dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};