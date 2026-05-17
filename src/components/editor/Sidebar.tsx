import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MusicPanel } from './MusicPanel';
import { LyricsPanel } from './LyricsPanel';
import { DesignPanel } from './DesignPanel';
import { Music, FileText, Palette } from 'lucide-react';
export function Sidebar() {
  return (
    <div className="w-96 border-r bg-card flex flex-col h-full overflow-hidden shadow-xl z-10">
      <div className="p-6 pb-2">
        <h1 className="text-xl font-bold flex items-center gap-2 tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center">
            <div className="w-4 h-4 bg-white/20 rounded-full animate-pulse" />
          </div>
          Lyricalise
        </h1>
      </div>
      <Tabs defaultValue="music" className="flex-1 flex flex-col">
        <div className="px-6 py-2">
          <TabsList className="w-full grid grid-cols-3 bg-secondary">
            <TabsTrigger value="music" className="gap-2">
              <Music className="w-4 h-4" />
              <span className="hidden sm:inline">Music</span>
            </TabsTrigger>
            <TabsTrigger value="lyrics" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Lyrics</span>
            </TabsTrigger>
            <TabsTrigger value="design" className="gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Design</span>
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <TabsContent value="music" className="m-0 focus-visible:outline-none">
            <MusicPanel />
          </TabsContent>
          <TabsContent value="lyrics" className="m-0 focus-visible:outline-none">
            <LyricsPanel />
          </TabsContent>
          <TabsContent value="design" className="m-0 focus-visible:outline-none h-full">
            <DesignPanel />
          </TabsContent>
        </div>
      </Tabs>
      <div className="p-4 border-t bg-muted/20 text-[10px] text-muted-foreground text-center">
        PRO EDITION v1.0 • MADE WITH JIOSAAVN & LRCLIB
      </div>
    </div>
  );
}