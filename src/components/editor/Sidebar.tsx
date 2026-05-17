import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MusicPanel } from './MusicPanel';
import { LyricsPanel } from './LyricsPanel';
import { DesignPanel } from './DesignPanel';
import { Music, FileText, Palette, Download, ChevronDown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
export function Sidebar() {
  return (
    <div className="w-96 border-r bg-card/30 backdrop-blur-xl flex flex-col h-full overflow-hidden shadow-2xl z-40">
      <div className="p-6 pb-4 flex items-center justify-between border-b border-white/5 bg-secondary/10">
        <h1 className="text-xl font-black flex items-center gap-3 tracking-tighter">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20 rotate-3">
            <Zap className="w-5 h-5 text-white fill-current animate-pulse" />
          </div>
          Lyricalise
        </h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="bg-primary/10 hover:bg-primary/20 text-primary border-none shadow-none rounded-xl gap-2 font-bold px-4 h-9">
              <Download className="w-3.5 h-3.5" />
              Export
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl border-white/5">
            <DropdownMenuItem className="gap-2 text-xs font-medium">Export as Video (HD)</DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-xs font-medium">Save Project File</DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-xs font-medium">Copy Metadata</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Tabs defaultValue="music" className="flex-1 flex flex-col">
        <div className="px-6 py-4 bg-secondary/5">
          <TabsList className="w-full grid grid-cols-3 h-12 p-1 bg-secondary/50 rounded-xl border border-white/5">
            <TabsTrigger value="music" className="gap-2 text-[10px] uppercase font-black tracking-widest rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary transition-all duration-300">
              <Music className="w-3.5 h-3.5" />
              Music
            </TabsTrigger>
            <TabsTrigger value="lyrics" className="gap-2 text-[10px] uppercase font-black tracking-widest rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary transition-all duration-300">
              <FileText className="w-3.5 h-3.5" />
              Lyrics
            </TabsTrigger>
            <TabsTrigger value="design" className="gap-2 text-[10px] uppercase font-black tracking-widest rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary transition-all duration-300">
              <Palette className="w-3.5 h-3.5" />
              Design
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-2 custom-scrollbar">
          <TabsContent value="music" className="m-0 focus-visible:outline-none animate-in fade-in slide-in-from-left-2 duration-300">
            <MusicPanel />
          </TabsContent>
          <TabsContent value="lyrics" className="m-0 focus-visible:outline-none animate-in fade-in slide-in-from-left-2 duration-300">
            <LyricsPanel />
          </TabsContent>
          <TabsContent value="design" className="m-0 focus-visible:outline-none h-full animate-in fade-in slide-in-from-left-2 duration-300">
            <DesignPanel />
          </TabsContent>
        </div>
      </Tabs>
      <div className="p-4 border-t border-white/5 bg-secondary/20 text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] text-center">
        Powered by AI • v1.5 Stable
      </div>
    </div>
  );
}