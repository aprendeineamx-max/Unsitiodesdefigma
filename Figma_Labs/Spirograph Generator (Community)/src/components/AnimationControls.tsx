import React from 'react';
import { Button } from './ui/button';
import { Play, Pause, Download } from 'lucide-react';
import { Slider } from './ui/slider';

interface AnimationControlsProps {
  isAnimating: boolean;
  onToggleAnimation: () => void;
  onSaveClick: () => void;
  animationSpeed: number;
  onSpeedChange: (speed: number) => void;
}

export const AnimationControls: React.FC<AnimationControlsProps> = ({
  isAnimating,
  onToggleAnimation,
  onSaveClick,
  animationSpeed,
  onSpeedChange,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border bg-[rgba(255,255,255,0.4)]">
      <div className="max-w-4xl mx-auto px-6 py-4 px-[21px] py-[12px]">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 min-w-[200px]">
              <Slider
                value={[animationSpeed]}
                onValueChange={([value]) => onSpeedChange(value)}
                min={1}
                max={20}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-8 text-center">
                {Math.round(animationSpeed)}x
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleAnimation}
                className="h-10 w-10 p-0"
              >
                {isAnimating ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {isAnimating ? 'Pause' : 'Play'}
                </span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onSaveClick}
                className="h-10 w-10 p-0"
              >
                <Download className="h-4 w-4" />
                <span className="sr-only">Save</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};