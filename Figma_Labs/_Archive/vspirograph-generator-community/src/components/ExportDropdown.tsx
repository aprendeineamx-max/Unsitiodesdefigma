import React, { useState } from 'react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { MoreHorizontal, Download, Share2, Copy, FileImage, FileText, Video, Image } from 'lucide-react';
import { SpirographParams } from './SpirographCanvas';
import { toast } from 'sonner@2.0.3';

interface ExportDropdownProps {
  params: SpirographParams;
  onExportSVG: () => string;
  onExportPNG: () => string;
  onExportGIF: () => Promise<void>;
  onExportMP4: () => Promise<void>;
  canvasRef: React.RefObject<any>;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  params,
  onExportSVG,
  onExportPNG,
  onExportGIF,
  onExportMP4,
  canvasRef,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportSVG = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const svgContent = onExportSVG();
      if (svgContent) {
        downloadFile(svgContent, 'spirograph.svg', 'image/svg+xml');
        toast('SVG exported successfully!');
      } else {
        toast('No content to export');
      }
    } catch (error) {
      console.error('SVG export error:', error);
      toast('Failed to export SVG');
    }
  };

  const handleExportPNG = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const pngDataUrl = onExportPNG();
      if (pngDataUrl) {
        const link = document.createElement('a');
        link.href = pngDataUrl;
        link.download = 'spirograph.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast('PNG exported successfully!');
      } else {
        toast('No content to export');
      }
    } catch (error) {
      console.error('PNG export error:', error);
      toast('Failed to export PNG');
    }
  };

  const handleExportGIF = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isExporting) return;
    
    setIsExporting(true);
    try {
      toast('Exporting GIF... This may take a moment.');
      await onExportGIF();
      toast('GIF exported successfully!');
    } catch (error) {
      console.error('GIF export error:', error);
      toast('Failed to export GIF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportMP4 = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isExporting) return;
    
    setIsExporting(true);
    try {
      toast('Exporting MP4... This may take a moment.');
      await onExportMP4();
      toast('MP4 exported successfully!');
    } catch (error) {
      console.error('MP4 export error:', error);
      toast('Failed to export MP4');
    } finally {
      setIsExporting(false);
    }
  };

  const generateShareableConfig = () => {
    const config = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      params: params,
    };
    return JSON.stringify(config, null, 2);
  };

  const handleCopyConfig = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const config = generateShareableConfig();
      await navigator.clipboard.writeText(config);
      toast('Configuration copied to clipboard!');
    } catch (error) {
      console.error('Copy config error:', error);
      toast('Failed to copy configuration');
    }
  };

  const handleDownloadConfig = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const config = generateShareableConfig();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      downloadFile(config, `spirograph-config-${timestamp}.json`, 'application/json');
      toast('Configuration downloaded!');
    } catch (error) {
      console.error('Download config error:', error);
      toast('Failed to download configuration');
    }
  };

  const generateShareableURL = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const encodedParams = btoa(JSON.stringify(params));
    return `${baseUrl}?config=${encodedParams}`;
  };

  const handleShareURL = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const url = generateShareableURL();
      await navigator.clipboard.writeText(url);
      toast('Shareable URL copied to clipboard!');
    } catch (error) {
      console.error('Share URL error:', error);
      toast('Failed to generate shareable URL');
    }
  };

  // Debug function to test if dropdown is working
  const handleTestClick = () => {
    console.log('Export dropdown clicked!');
    toast('Export dropdown is working!');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-9 w-9 p-0" 
          disabled={isExporting}
          onClick={handleTestClick}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Export options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 z-50">
        {/* Static Export Options */}
        <DropdownMenuItem onClick={handleExportPNG}>
          <FileImage className="mr-2 h-4 w-4" />
          Export as PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportSVG}>
          <FileText className="mr-2 h-4 w-4" />
          Export as SVG
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Animated Export Options */}
        <DropdownMenuItem onClick={handleExportGIF} disabled={isExporting}>
          <Image className="mr-2 h-4 w-4" />
          Export as GIF {isExporting && '(Exporting...)'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportMP4} disabled={isExporting}>
          <Video className="mr-2 h-4 w-4" />
          Export as MP4 {isExporting && '(Exporting...)'}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Sharing Options */}
        <DropdownMenuItem onClick={handleShareURL}>
          <Share2 className="mr-2 h-4 w-4" />
          Copy Shareable URL
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyConfig}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Configuration
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadConfig}>
          <Download className="mr-2 h-4 w-4" />
          Download Config JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};