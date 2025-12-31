import React, { useState, useRef, useEffect } from 'react';
import { SpirographCanvas, SpirographParams, SpirographCanvasRef } from './components/SpirographCanvas';
import { ControlPanel } from './components/ControlPanel';
import { SavePanel } from './components/SavePanel';
import { PresetSelector, spirographPresets } from './components/PresetSelector';
import { AnimationControls } from './components/AnimationControls';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './components/ui/sheet';
import { Separator } from './components/ui/separator';
import { Moon, Sun, Edit, Shuffle } from 'lucide-react';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [params, setParams] = useState<SpirographParams | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 });
  const canvasRef = useRef<SpirographCanvasRef>(null);

  // Calculate canvas dimensions based on viewport height
  const calculateCanvasDimensions = () => {
    const vh = window.innerHeight;
    const targetHeight = Math.floor(vh * 0.79); // 79vh for optimal spacing
    const aspectRatio = 4 / 3; // Maintain 4:3 aspect ratio (800:600)
    const targetWidth = Math.floor(targetHeight * aspectRatio);
    
    // Ensure minimum and maximum sizes
    const minHeight = 400;
    const maxHeight = 800;
    const minWidth = Math.floor(minHeight * aspectRatio);
    const maxWidth = Math.floor(maxHeight * aspectRatio);
    
    const height = Math.max(minHeight, Math.min(maxHeight, targetHeight));
    const width = Math.floor(height * aspectRatio);
    
    return { width, height };
  };

  // Create default params with dynamic center
  const createDefaultParams = (width: number, height: number): SpirographParams => ({
    R: 120,
    r: 30,
    d: 80,
    cycles: 8,
    loops: 1000,
    speed: 5,
    xFactor: 1,
    yFactor: 1,
    centerX: width / 2,
    centerY: height / 2,
    rotation: 0,
    strokeColor: '#ff006e',
    backgroundColor: '#000000',
    strokeWidth: 2,
  });

  // Generate truly random spirograph parameters with dynamic center
  const generateRandomParams = (width: number, height: number): SpirographParams => {
    // Helper function to generate random number between min and max
    const random = (min: number, max: number) => Math.random() * (max - min) + min;
    
    // Helper function to generate random integer between min and max
    const randomInt = (min: number, max: number) => Math.floor(random(min, max + 1));
    
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

    const R = randomInt(60, 180);
    const r = randomInt(10, Math.min(R - 10, 80)); // Ensure r is smaller than R
    const d = randomInt(20, Math.max(r + 20, 120));
    
    return {
      R,
      r,
      d,
      cycles: randomInt(3, 25),
      loops: randomInt(200, 2000),
      speed: random(2, 12),
      xFactor: random(0.5, 2.5),
      yFactor: random(0.5, 2.5),
      centerX: width / 2,
      centerY: height / 2,
      rotation: randomInt(0, 360),
      strokeColor: generateRandomColor(),
      backgroundColor: generateBackgroundColor(),
      strokeWidth: random(1, 4),
    };
  };

  // Initialize canvas dimensions and params
  useEffect(() => {
    const dimensions = calculateCanvasDimensions();
    setCanvasDimensions(dimensions);

    const urlParams = new URLSearchParams(window.location.search);
    const configParam = urlParams.get('config');
    
    if (configParam) {
      try {
        const decodedConfig = JSON.parse(atob(configParam));
        // Update center coordinates for the new canvas size
        const updatedConfig = {
          ...decodedConfig,
          centerX: dimensions.width / 2,
          centerY: dimensions.height / 2,
        };
        setParams(updatedConfig);
        setIsAnimating(true);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to load configuration from URL:', error);
        const randomParams = generateRandomParams(dimensions.width, dimensions.height);
        setParams(randomParams);
        setIsAnimating(true);
        setIsInitialized(true);
      }
    } else {
      const randomParams = generateRandomParams(dimensions.width, dimensions.height);
      setParams(randomParams);
      setIsAnimating(true);
      setIsInitialized(true);
    }
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const dimensions = calculateCanvasDimensions();
      setCanvasDimensions(dimensions);
      
      // Update existing params with new center coordinates
      if (params) {
        setParams(prevParams => ({
          ...prevParams!,
          centerX: dimensions.width / 2,
          centerY: dimensions.height / 2,
        }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [params]);

  // Toggle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };

  const handleReset = () => {
    setIsAnimating(false);
    if (params) {
      const defaultParams = createDefaultParams(canvasDimensions.width, canvasDimensions.height);
      setParams(defaultParams);
    }
  };

  const handleRandomGenerate = () => {
    const randomParams = generateRandomParams(canvasDimensions.width, canvasDimensions.height);
    setParams(randomParams);
    setIsAnimating(true);
  };

  const handlePresetSelect = (presetParams: SpirographParams) => {
    // Update preset params with current canvas center
    const updatedParams = {
      ...presetParams,
      centerX: canvasDimensions.width / 2,
      centerY: canvasDimensions.height / 2,
    };
    setParams(updatedParams);
    setIsAnimating(true);
  };

  const handleSaveClick = () => {
    setIsSaveOpen(true);
  };

  // Don't render until params are initialized
  if (!params) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Toaster />
      
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 bg-[rgba(255,255,255,0.4)]">
        <div className="max-w-7xl mx-auto px-6 py-4 px-[21px] py-[12px]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-medium text-[14px]">Spirograph Generator</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleRandomGenerate}
                className="flex items-center gap-2 h-10 text-[12px]"
              >
                <Shuffle className="h-4 w-4" />
                Random
              </Button>
              <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10 w-10 p-0">
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[360px]" hideOverlay={true}>
                  <SheetHeader className="px-4 pt-[24px] pb-[4px] pr-[14px] pl-[14px]">
                    <SheetTitle className="text-sm">Edit</SheetTitle>
                  </SheetHeader>
                  <Separator />
                  <div className="overflow-y-auto h-full px-4 pt-4">
                    <ControlPanel
                      params={params}
                      onChange={setParams}
                    />
                  </div>
                </SheetContent>
              </Sheet>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="h-10 w-10 p-0"
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className="h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="w-full max-w-6xl px-6">
          {/* Centered Canvas */}
          <div className="flex justify-center">
            <Card className="w-fit py-[12px] p-[10px]">
              {isInitialized ? (
                <SpirographCanvas
                  ref={canvasRef}
                  params={params}
                  isAnimating={isAnimating}
                  onAnimationComplete={handleAnimationComplete}
                  width={canvasDimensions.width}
                  height={canvasDimensions.height}
                />
              ) : (
                <div 
                  className="flex items-center justify-center"
                  style={{ width: canvasDimensions.width, height: canvasDimensions.height }}
                >
                  <div className="text-muted-foreground text-sm">Loading...</div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      {/* Save Panel Sheet */}
      <Sheet open={isSaveOpen} onOpenChange={setIsSaveOpen}>
        <SheetContent side="right" className="w-[360px]" hideOverlay={true}>
          <SheetHeader className="px-4 pt-[24px] pb-[4px] pr-[14px] pl-[14px]">
            <SheetTitle className="text-sm">Save</SheetTitle>
          </SheetHeader>
          <Separator />
          <div className="overflow-y-auto h-full px-4 pt-4">
            <SavePanel
              canvasRef={canvasRef}
              params={params}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Presets Section */}
      <section className="py-12 pt-[42px] pr-[0px] pb-[0px] pl-[0px]">
        <div className="max-w-6xl mx-auto px-6 mx-[10px] my-[0px] p-[0px]">
          <Card className="p-[28px]">
            <div className="m-[0px]">
              <h2 className="text-xl font-medium mb-2 text-[14px]">Presets</h2>
            </div>
            <PresetSelector
              onPresetSelect={handlePresetSelect}
              currentParams={params}
            />
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-0">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <div>
              <p>
                Created by{' '}
                <a 
                  href="https://danielamuntyan.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors underline decoration-dotted underline-offset-4"
                >
                  Daniela Muntyan
                </a>
                {' '}in{' '}
                <a 
                  href="https://www.figma.com/make/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors underline decoration-dotted underline-offset-4"
                >
                  Figma Make
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Animation Controls */}
      <AnimationControls
        isAnimating={isAnimating}
        onToggleAnimation={() => setIsAnimating(!isAnimating)}
        onSaveClick={handleSaveClick}
        animationSpeed={params.speed}
        onSpeedChange={(speed) => setParams({ ...params, speed })}
      />
    </div>
  );
}