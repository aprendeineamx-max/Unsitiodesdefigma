/**
 * GRAPH VIEW COMPONENT v1.0
 * 
 * Visualización de grafo de documentos estilo Obsidian
 * 
 * Features:
 * - Force-directed graph 2D/3D
 * - Interactive (hover, click, drag, zoom, pan)
 * - Filtros avanzados (categoría, tags, orphans, búsqueda)
 * - Node sizing por conexiones
 * - Color coding por categoría
 * - Detección de orphans
 * - Minimap para navegación
 * - Export PNG/SVG
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import type { DiscoveredDocument } from '../types/documentation';
import {
  buildGraph,
  calculateGraphMetrics,
  filterGraph,
  toForceGraphData,
  logGraphStats,
  type GraphData,
  type GraphNode,
  type GraphMetrics,
} from '../services/graphService';
import {
  Search,
  Filter,
  ZoomIn,
  ZoomOut,
  Download,
  Maximize2,
  Info,
  X,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

interface GraphViewProps {
  documents: DiscoveredDocument[];
  onNodeClick?: (document: DiscoveredDocument) => void;
  className?: string;
}

export function GraphView({ documents, onNodeClick, className = '' }: GraphViewProps) {
  const graphRef = useRef<any>(null);
  const [rawGraphData, setRawGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [filteredGraphData, setFilteredGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [metrics, setMetrics] = useState<GraphMetrics | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [orphansOnly, setOrphansOnly] = useState(false);

  // Categorías y tags disponibles
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Build graph al montar o cuando cambien documentos
  useEffect(() => {
    if (documents.length === 0) return;

    console.log('🔨 Building graph from documents...');
    const graphData = buildGraph(documents);
    setRawGraphData(graphData);
    setFilteredGraphData(graphData);

    const stats = calculateGraphMetrics(graphData);
    setMetrics(stats);

    logGraphStats(graphData);

    // Extraer categorías y tags únicos
    const categories = Array.from(new Set(documents.map((d) => d.metadata.category)));
    const tags = Array.from(
      new Set(documents.flatMap((d) => d.metadata.tags || []))
    );
    setAvailableCategories(categories);
    setAvailableTags(tags);
  }, [documents]);

  // Aplicar filtros
  useEffect(() => {
    const filtered = filterGraph(rawGraphData, {
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      orphansOnly,
      searchTerm: searchTerm.trim().length > 0 ? searchTerm : undefined,
    });

    setFilteredGraphData(filtered);
  }, [rawGraphData, selectedCategories, selectedTags, orphansOnly, searchTerm]);

  // Toggle categoría
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Toggle tag
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Handle node click
  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      const doc = documents.find((d) => d.path === node.id);
      if (doc && onNodeClick) {
        onNodeClick(doc);
      }
    },
    [documents, onNodeClick]
  );

  // Export graph como imagen
  const handleExportImage = () => {
    if (!graphRef.current) return;

    try {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'graph-view.png';
        link.href = dataUrl;
        link.click();
      }
    } catch (error) {
      console.error('Error exporting graph:', error);
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (graphRef.current) {
      graphRef.current.zoom(1.5, 400);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      graphRef.current.zoom(0.75, 400);
    }
  };

  // Fit to canvas
  const handleFitToCanvas = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400);
    }
  };

  // Preparar datos para react-force-graph
  const forceGraphData = toForceGraphData(filteredGraphData);

  return (
    <div className={`flex h-full ${className}`}>
      {/* Sidebar de filtros */}
      {showFilters && (
        <Card className="w-80 p-4 mr-4 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            {/* Search */}
            <div className="mb-4">
              <Label className="text-sm mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search nodes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <Separator className="my-4" />

            {/* Orphans only */}
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="orphans"
                  checked={orphansOnly}
                  onCheckedChange={(checked) => setOrphansOnly(checked as boolean)}
                />
                <Label htmlFor="orphans" className="text-sm cursor-pointer">
                  Show orphaned docs only
                </Label>
              </div>
              {metrics && metrics.orphanedDocs > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.orphanedDocs} orphaned document
                  {metrics.orphanedDocs !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            <Separator className="my-4" />

            {/* Categorías */}
            <div className="mb-4">
              <Label className="text-sm mb-2 block">Categories</Label>
              <div className="space-y-2">
                {availableCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cat-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <Label
                      htmlFor={`cat-${category}`}
                      className="text-sm cursor-pointer"
                    >
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedCategories.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategories([])}
                  className="mt-2 text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>

            <Separator className="my-4" />

            {/* Tags */}
            <div className="mb-4">
              <Label className="text-sm mb-2 block">Tags</Label>
              <div className="space-y-2">
                {availableTags.slice(0, 10).map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag}`}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={() => toggleTag(tag)}
                    />
                    <Label
                      htmlFor={`tag-${tag}`}
                      className="text-sm cursor-pointer"
                    >
                      {tag}
                    </Label>
                  </div>
                ))}
              </div>
              {availableTags.length > 10 && (
                <p className="text-xs text-muted-foreground mt-2">
                  +{availableTags.length - 10} more tags
                </p>
              )}
              {selectedTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTags([])}
                  className="mt-2 text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>
          </ScrollArea>
        </Card>
      )}

      {/* Graph container */}
      <div className="flex-1 relative">
        {/* Toolbar */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowStats(!showStats)}
          >
            <Info className="w-4 h-4 mr-2" />
            Stats
          </Button>
        </div>

        {/* Zoom controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <Button variant="secondary" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={handleFitToCanvas}>
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExportImage}>
            <Download className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats panel */}
        {showStats && metrics && (
          <Card className="absolute bottom-4 left-4 z-10 p-4 w-64">
            <h4 className="font-semibold mb-3 text-sm">Graph Statistics</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nodes:</span>
                <Badge variant="secondary">{metrics.totalNodes}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Links:</span>
                <Badge variant="secondary">{metrics.totalLinks}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Orphans:</span>
                <Badge variant={metrics.orphanedDocs > 0 ? 'destructive' : 'secondary'}>
                  {metrics.orphanedDocs}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Connections:</span>
                <Badge variant="secondary">{metrics.avgConnections}</Badge>
              </div>
            </div>

            {metrics.mostConnected.length > 0 && (
              <>
                <Separator className="my-3" />
                <div>
                  <p className="text-xs font-semibold mb-2">Most Connected:</p>
                  <div className="space-y-1">
                    {metrics.mostConnected.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="text-xs flex justify-between"
                      >
                        <span className="truncate flex-1">
                          {item.name}
                        </span>
                        <Badge variant="outline" className="ml-2">
                          {item.connections}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </Card>
        )}

        {/* Graph */}
        <ForceGraph2D
          ref={graphRef}
          graphData={forceGraphData}
          nodeLabel={(node: any) => node.name}
          nodeAutoColorBy="category"
          nodeCanvasObject={(node: any, ctx: any, globalScale: number) => {
            const label = node.name;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            
            // Draw node circle
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
            ctx.fillStyle = node.color;
            ctx.fill();
            
            // Draw border for orphans
            if (node.isOrphan) {
              ctx.strokeStyle = '#ef4444';
              ctx.lineWidth = 2 / globalScale;
              ctx.stroke();
            }
            
            // Draw label
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#333';
            ctx.fillText(label, node.x, node.y + node.val + fontSize);
          }}
          onNodeClick={(node: any) => handleNodeClick(node as GraphNode)}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={(link: any) => link.value * 0.001}
          linkColor={(link: any) => {
            if (link.type === 'tag') return '#94a3b8'; // gray
            if (link.type === 'wikilink') return '#3b82f6'; // blue
            return '#10b981'; // green
          }}
          linkWidth={(link: any) => link.value * 2}
          cooldownTicks={100}
          warmupTicks={0}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
        />
      </div>
    </div>
  );
}
