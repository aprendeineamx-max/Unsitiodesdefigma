import React, { useState } from 'react';
import { SpirographParams, SpirographCanvasRef } from './SpirographCanvas';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { Download, Image, FileImage, FileType, Share2, Palette, Video } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SavePanelProps {
  canvasRef: React.RefObject<SpirographCanvasRef>;
  params: SpirographParams;
}

interface ExportSettings {
  format: 'png' | 'jpeg' | 'svg' | 'pdf';
  quality: number;
  size: string;
  transparent: boolean;
  filename: string;
}

interface VideoExportSettings {
  duration: number; // in seconds
  fps: number;
  quality: 'low' | 'medium' | 'high';
  size: string;
}

export function SavePanel({ canvasRef, params }: SavePanelProps) {
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'png',
    quality: 100,
    size: '800x600',
    transparent: false,
    filename: 'spirograph'
  });

  const [videoExportSettings, setVideoExportSettings] = useState<VideoExportSettings>({
    duration: 5,
    fps: 30,
    quality: 'medium',
    size: '800x600'
  });

  const [isExporting, setIsExporting] = useState(false);
  const [isVideoExporting, setIsVideoExporting] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const sizeOptions = [
    { label: 'Original (800×600)', value: '800x600' },
    { label: 'Small (400×300)', value: '400x300' },
    { label: 'Medium (1200×900)', value: '1200x900' },
    { label: 'Large (1600×1200)', value: '1600x1200' },
    { label: 'HD (1920×1440)', value: '1920x1440' },
    { label: 'Ultra HD (3200×2400)', value: '3200x2400' },
  ];

  const qualityOptions = [
    { label: 'Maximum (100%)', value: 100 },
    { label: 'High (90%)', value: 90 },
    { label: 'Medium (75%)', value: 75 },
    { label: 'Low (50%)', value: 50 },
  ];

  const videoDurationOptions = [
    { label: '3 seconds', value: 3 },
    { label: '5 seconds', value: 5 },
    { label: '10 seconds', value: 10 },
    { label: '15 seconds', value: 15 },
    { label: '30 seconds', value: 30 },
  ];

  const videoFpsOptions = [
    { label: '15 FPS', value: 15 },
    { label: '24 FPS', value: 24 },
    { label: '30 FPS', value: 30 },
    { label: '60 FPS', value: 60 },
  ];

  const videoQualityOptions = [
    { label: 'Low (Fast)', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High (Slow)', value: 'high' },
  ];

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const createCanvas = (width: number, height: number): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    // Set background
    if (!exportSettings.transparent) {
      ctx.fillStyle = params.backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }
    
    // Draw spirograph
    ctx.strokeStyle = params.strokeColor;
    ctx.lineWidth = params.strokeWidth * (width / 800); // Scale stroke width
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width / 800, height / 600);
    
    // Generate the complete spirograph path
    const { R, r, d, cycles } = params;
    const points: { x: number; y: number }[] = [];
    
    for (let i = 0; i <= cycles * 360; i += 0.5) {
      const t = (i * Math.PI) / 180;
      const x = (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t);
      const y = (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t);
      
      const scaledX = centerX + (x * params.xFactor * scale);
      const scaledY = centerY + (y * params.yFactor * scale);
      
      points.push({ x: scaledX, y: scaledY });
    }
    
    // Draw the path
    if (points.length > 0) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    }
    
    return canvas;
  };

  const createAnimationFrame = (width: number, height: number, progress: number): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    // Set background
    ctx.fillStyle = params.backgroundColor;
    ctx.fillRect(0, 0, width, height);
    
    // Draw spirograph up to current progress
    ctx.strokeStyle = params.strokeColor;
    ctx.lineWidth = params.strokeWidth * (width / 800);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width / 800, height / 600);
    
    const { R, r, d, cycles } = params;
    const maxPoints = cycles * 360 * 2; // * 2 because we increment by 0.5
    const currentPoints = Math.floor(maxPoints * progress);
    
    const points: { x: number; y: number }[] = [];
    
    for (let i = 0; i <= currentPoints; i++) {
      const t = (i * 0.5 * Math.PI) / 180;
      const x = (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t);
      const y = (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t);
      
      const scaledX = centerX + (x * params.xFactor * scale);
      const scaledY = centerY + (y * params.yFactor * scale);
      
      points.push({ x: scaledX, y: scaledY });
    }
    
    // Draw the path
    if (points.length > 1) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    }
    
    return canvas;
  };

  const exportImage = async () => {
    if (!canvasRef.current) {
      toast.error('Canvas not available');
      return;
    }

    setIsExporting(true);
    
    try {
      const [width, height] = exportSettings.size.split('x').map(Number);
      const canvas = createCanvas(width, height);
      
      let blob: Blob;
      let extension: string;
      
      if (exportSettings.format === 'png') {
        blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/png');
        });
        extension = '.png';
      } else if (exportSettings.format === 'jpeg') {
        blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/jpeg', exportSettings.quality / 100);
        });
        extension = '.jpg';
      } else if (exportSettings.format === 'svg') {
        // Generate SVG
        const svg = generateSVG(width, height);
        blob = new Blob([svg], { type: 'image/svg+xml' });
        extension = '.svg';
      } else {
        toast.error('Format not supported yet');
        return;
      }
      
      const filename = `${exportSettings.filename}${extension}`;
      downloadFile(blob, filename);
      toast.success(`Saved as ${filename}`);
      
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const generateSVG = (width: number, height: number): string => {
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width / 800, height / 600);
    
    const { R, r, d, cycles } = params;
    const points: string[] = [];
    
    for (let i = 0; i <= cycles * 360; i += 0.5) {
      const t = (i * Math.PI) / 180;
      const x = (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t);
      const y = (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t);
      
      const scaledX = centerX + (x * params.xFactor * scale);
      const scaledY = centerY + (y * params.yFactor * scale);
      
      points.push(`${scaledX},${scaledY}`);
    }
    
    const pathData = `M ${points.join(' L ')}`;
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  ${!exportSettings.transparent ? `<rect width="100%" height="100%" fill="${params.backgroundColor}"/>` : ''}
  <path d="${pathData}" 
        stroke="${params.strokeColor}" 
        stroke-width="${params.strokeWidth * scale}" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        fill="none"/>
</svg>`;
  };

  const exportVideo = async () => {
    setIsVideoExporting(true);
    setRecordingTime(0);
    
    try {
      const [width, height] = videoExportSettings.size.split('x').map(Number);
      
      // Create a temporary canvas for recording
      const recordCanvas = document.createElement('canvas');
      recordCanvas.width = width;
      recordCanvas.height = height;
      const ctx = recordCanvas.getContext('2d')!;
      
      // Set up MediaRecorder
      const stream = recordCanvas.captureStream(videoExportSettings.fps);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: videoExportSettings.quality === 'high' ? 5000000 : 
                           videoExportSettings.quality === 'medium' ? 2500000 : 1000000
      });
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const filename = `${exportSettings.filename}.webm`;
        downloadFile(blob, filename);
        toast.success(`Video saved as ${filename}`);
        setIsVideoExporting(false);
        setRecordingTime(0);
      };
      
      // Start recording
      mediaRecorder.start();
      
      const totalFrames = videoExportSettings.duration * videoExportSettings.fps;
      const frameInterval = 1000 / videoExportSettings.fps;
      const startTime = Date.now();
      
      // Counter update interval
      const counterInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setRecordingTime(Math.min(elapsed, videoExportSettings.duration));
      }, 1000);
      
      toast.info(`Recording ${videoExportSettings.duration}s video...`);
      
      for (let frame = 0; frame < totalFrames; frame++) {
        const progress = frame / totalFrames;
        
        // Clear canvas
        ctx.fillStyle = params.backgroundColor;
        ctx.fillRect(0, 0, width, height);
        
        // Draw spirograph frame
        const frameCanvas = createAnimationFrame(width, height, progress);
        ctx.drawImage(frameCanvas, 0, 0);
        
        // Wait for next frame
        await new Promise(resolve => setTimeout(resolve, frameInterval));
      }
      
      // Clean up counter
      clearInterval(counterInterval);
      
      // Stop recording
      mediaRecorder.stop();
      
    } catch (error) {
      console.error('Video export failed:', error);
      toast.error('Video export failed. Try using a different browser.');
      setIsVideoExporting(false);
      setRecordingTime(0);
    }
  };

  const exportConfiguration = () => {
    const config = {
      ...params,
      exported: new Date().toISOString(),
      generator: 'Spirograph Generator'
    };
    
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const filename = `${exportSettings.filename}-config.json`;
    
    downloadFile(blob, filename);
    toast.success(`Configuration saved as ${filename}`);
  };

  const shareConfiguration = async () => {
    const config = btoa(JSON.stringify(params));
    const url = `${window.location.origin}${window.location.pathname}?config=${config}`;
    
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Quick Export */}
      <div>
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3 px-1">Quick Export</h3>
        <Card className="p-3">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={() => {
                setExportSettings({ ...exportSettings, format: 'png', size: '1920x1440', transparent: false });
                setTimeout(exportImage, 100);
              }}
              variant="outline" 
              className="h-8 text-xs"
            >
              <FileImage className="h-3 w-3 mr-1" />
              HD PNG
            </Button>
            
            <Button 
              onClick={() => {
                setExportSettings({ ...exportSettings, format: 'svg', transparent: true });
                setTimeout(exportImage, 100);
              }}
              variant="outline" 
              className="h-8 text-xs"
            >
              <Palette className="h-3 w-3 mr-1" />
              Vector SVG
            </Button>
          </div>
        </Card>
      </div>

      {/* Image Export */}
      <div>
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3 px-1">Image Export</h3>
        <Card className="p-3">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Format</Label>
                <Select 
                  value={exportSettings.format} 
                  onValueChange={(value: any) => setExportSettings({ ...exportSettings, format: value })}
                >
                  <SelectTrigger className="h-6 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="svg">SVG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Size</Label>
                <Select 
                  value={exportSettings.size} 
                  onValueChange={(value) => setExportSettings({ ...exportSettings, size: value })}
                >
                  <SelectTrigger className="h-6 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sizeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {exportSettings.format === 'jpeg' && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Quality</Label>
                <Select 
                  value={exportSettings.quality.toString()} 
                  onValueChange={(value) => setExportSettings({ ...exportSettings, quality: parseInt(value) })}
                >
                  <SelectTrigger className="h-6 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {qualityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Transparent Background</Label>
              <Switch
                checked={exportSettings.transparent}
                onCheckedChange={(checked) => setExportSettings({ ...exportSettings, transparent: checked })}
                disabled={exportSettings.format === 'jpeg'}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Filename</Label>
              <Input
                value={exportSettings.filename}
                onChange={(e) => setExportSettings({ ...exportSettings, filename: e.target.value })}
                placeholder="spirograph"
                className="h-6 text-xs px-2"
              />
            </div>
            
            <Button 
              onClick={exportImage} 
              disabled={isExporting}
              className="w-full h-8 text-xs"
            >
              <Download className="h-3 w-3 mr-2" />
              {isExporting ? 'Exporting...' : 'Download Image'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Video Export */}
      <div>
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3 px-1">Video Export</h3>
        <Card className="p-3">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Duration</Label>
                <Select 
                  value={videoExportSettings.duration.toString()} 
                  onValueChange={(value) => setVideoExportSettings({ ...videoExportSettings, duration: parseInt(value) })}
                >
                  <SelectTrigger className="h-6 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {videoDurationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Frame Rate</Label>
                <Select 
                  value={videoExportSettings.fps.toString()} 
                  onValueChange={(value) => setVideoExportSettings({ ...videoExportSettings, fps: parseInt(value) })}
                >
                  <SelectTrigger className="h-6 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {videoFpsOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Quality</Label>
                <Select 
                  value={videoExportSettings.quality} 
                  onValueChange={(value: any) => setVideoExportSettings({ ...videoExportSettings, quality: value })}
                >
                  <SelectTrigger className="h-6 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {videoQualityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Size</Label>
                <Select 
                  value={videoExportSettings.size} 
                  onValueChange={(value) => setVideoExportSettings({ ...videoExportSettings, size: value })}
                >
                  <SelectTrigger className="h-6 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sizeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={exportVideo} 
              disabled={isVideoExporting}
              className="w-full h-8 text-xs"
            >
              <Video className="h-3 w-3 mr-2" />
              {isVideoExporting ? `Recording ${recordingTime}s / ${videoExportSettings.duration}s` : 'Export Video'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Share & Config */}
      <div>
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3 px-1">Share & Config</h3>
        <Card className="p-3">
          <div className="space-y-2">
            <Button 
              onClick={shareConfiguration} 
              variant="outline" 
              className="w-full h-8 text-xs"
            >
              <Share2 className="h-3 w-3 mr-2" />
              Copy Share Link
            </Button>
            
            <Button 
              onClick={exportConfiguration} 
              variant="outline" 
              className="w-full h-8 text-xs"
            >
              <FileType className="h-3 w-3 mr-2" />
              Export Config (JSON)
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}