/**
 * BACKLINKS PANEL COMPONENT v1.0
 * 
 * Panel de backlinks bidireccionales estilo Obsidian
 * 
 * Features:
 * - Linked mentions con preview
 * - Unlinked mentions con fuzzy matching
 * - Click to navigate
 * - "Link it" button para convertir mentions en links
 * - Count badges
 * - Filtros (linked only, unlinked only, all)
 * - Sorting
 */

import { useState, useEffect } from 'react';
import type { DiscoveredDocument } from '../types/documentation';
import {
  getBacklinks,
  generateLinkText,
  logBacklinkStats,
  type LinkedMention,
  type UnlinkedMention,
  type BacklinkData,
} from '../services/backlinkService';
import {
  Link,
  Link2,
  Link2Off,
  ArrowUpRight,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface BacklinksPanelProps {
  targetDocument: DiscoveredDocument | null;
  allDocuments: DiscoveredDocument[];
  onNavigate?: (document: DiscoveredDocument) => void;
  className?: string;
}

export function BacklinksPanel({
  targetDocument,
  allDocuments,
  onNavigate,
  className = '',
}: BacklinksPanelProps) {
  const [backlinkData, setBacklinkData] = useState<BacklinkData | null>(null);
  const [copiedLinkIndex, setCopiedLinkIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'linked' | 'unlinked'>('all');

  // Load backlinks cuando cambie el documento
  useEffect(() => {
    if (!targetDocument) {
      setBacklinkData(null);
      return;
    }

    console.log(`🔍 Loading backlinks for "${targetDocument.metadata.title}"...`);
    
    const data = getBacklinks(targetDocument, allDocuments, {
      includeUnlinked: true,
      minConfidence: 0.4,
      maxUnlinked: 20,
    });

    setBacklinkData(data);
    logBacklinkStats(data, targetDocument.metadata.title);
  }, [targetDocument, allDocuments]);

  // Handle navigation
  const handleNavigate = (path: string) => {
    const doc = allDocuments.find((d) => d.path === path);
    if (doc && onNavigate) {
      onNavigate(doc);
    }
  };

  // Copy link text
  const handleCopyLink = (mention: UnlinkedMention, index: number) => {
    if (!targetDocument) return;

    const linkText = generateLinkText(mention, targetDocument, 'wikilink');
    
    navigator.clipboard.writeText(linkText).then(() => {
      setCopiedLinkIndex(index);
      setTimeout(() => setCopiedLinkIndex(null), 2000);
    });
  };

  // Si no hay documento seleccionado
  if (!targetDocument) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-muted-foreground">
          <Link2Off className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Select a document to view backlinks</p>
        </div>
      </Card>
    );
  }

  // Si no hay backlinks
  if (!backlinkData || backlinkData.totalCount === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Link2 className="w-4 h-4" />
          Backlinks
        </h3>
        <div className="text-center text-muted-foreground py-8">
          <p className="text-sm">No backlinks found</p>
          <p className="text-xs mt-1">
            This document is not referenced by any other document
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <Link2 className="w-4 h-4" />
          Backlinks
          <Badge variant="secondary" className="ml-auto">
            {backlinkData.totalCount}
          </Badge>
        </h3>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-4 mt-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            All
            <Badge variant="outline" className="ml-1">
              {backlinkData.totalCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="linked" className="flex items-center gap-2">
            Linked
            <Badge variant="outline" className="ml-1">
              {backlinkData.linkedMentions.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unlinked" className="flex items-center gap-2">
            Unlinked
            <Badge variant="outline" className="ml-1">
              {backlinkData.unlinkedMentions.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* All tab */}
        <TabsContent value="all" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {/* Linked mentions */}
              {backlinkData.linkedMentions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Link className="w-3 h-3" />
                    LINKED MENTIONS ({backlinkData.linkedMentions.length})
                  </h4>
                  <div className="space-y-2">
                    {backlinkData.linkedMentions.map((mention, index) => (
                      <LinkedMentionCard
                        key={`linked-${index}`}
                        mention={mention}
                        onNavigate={handleNavigate}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Unlinked mentions */}
              {backlinkData.unlinkedMentions.length > 0 && (
                <div>
                  {backlinkData.linkedMentions.length > 0 && <Separator className="my-4" />}
                  <h4 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Link2Off className="w-3 h-3" />
                    UNLINKED MENTIONS ({backlinkData.unlinkedMentions.length})
                  </h4>
                  <div className="space-y-2">
                    {backlinkData.unlinkedMentions.map((mention, index) => (
                      <UnlinkedMentionCard
                        key={`unlinked-${index}`}
                        mention={mention}
                        onNavigate={handleNavigate}
                        onCopyLink={() => handleCopyLink(mention, index)}
                        isCopied={copiedLinkIndex === index}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Linked only tab */}
        <TabsContent value="linked" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {backlinkData.linkedMentions.map((mention, index) => (
                <LinkedMentionCard
                  key={`linked-only-${index}`}
                  mention={mention}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Unlinked only tab */}
        <TabsContent value="unlinked" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {backlinkData.unlinkedMentions.map((mention, index) => (
                <UnlinkedMentionCard
                  key={`unlinked-only-${index}`}
                  mention={mention}
                  onNavigate={handleNavigate}
                  onCopyLink={() => handleCopyLink(mention, index)}
                  isCopied={copiedLinkIndex === index}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

/**
 * Linked Mention Card
 */
function LinkedMentionCard({
  mention,
  onNavigate,
}: {
  mention: LinkedMention;
  onNavigate: (path: string) => void;
}) {
  return (
    <div
      className="p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors group"
      onClick={() => onNavigate(mention.sourceDocument.path)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          <Link className="w-3 h-3 text-blue-500 flex-shrink-0" />
          <span className="font-medium text-sm">
            {mention.sourceDocument.title}
          </span>
          <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <Badge variant="outline" className="text-xs">
          {mention.linkType}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">
        {mention.context}
      </p>
    </div>
  );
}

/**
 * Unlinked Mention Card
 */
function UnlinkedMentionCard({
  mention,
  onNavigate,
  onCopyLink,
  isCopied,
}: {
  mention: UnlinkedMention;
  onNavigate: (path: string) => void;
  onCopyLink: () => void;
  isCopied: boolean;
}) {
  return (
    <div className="p-3 bg-muted/30 rounded-lg border border-dashed group">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          <Link2Off className="w-3 h-3 text-orange-500 flex-shrink-0" />
          <span
            className="font-medium text-sm hover:underline cursor-pointer"
            onClick={() => onNavigate(mention.sourceDocument.path)}
          >
            {mention.sourceDocument.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="text-xs"
            title={`Confidence: ${(mention.confidence * 100).toFixed(0)}%`}
          >
            {(mention.confidence * 100).toFixed(0)}%
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCopyLink}
            className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {isCopied ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">
        {mention.context}
      </p>
    </div>
  );
}
