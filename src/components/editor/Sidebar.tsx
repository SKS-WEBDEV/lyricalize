import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MusicPanel } from './MusicPanel';
import { LyricsPanel } from './LyricsPanel';
import { DesignPanel } from './DesignPanel';
import { Music, FileText, Palette, Download, ChevronDown, Zap, Save, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useEditorStore } from '@/store/useEditorStore';
import { toast } from 'sonner';
export function Sidebar() {
  const track = useEditorStore((s) => s.track);
  const lyrics = useEditorStore((s) => s.lyrics);
  const style = useEditorStore((s) => s.style);
  const lyricOffset = useEditorStore((s) => s.lyricOffset);
  const handleSaveProject = () => {
    try {
      const projectData = {
        version: '1.5',
        timestamp: new Date().toISOString(),
        track,
        lyrics,
        style,
        lyricOffset
      };
      const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lyricalise-${track?.title || 'project'}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Project saved successfully!');
    } catch (error) {
      console.error('Failed to save project:', error);
      toast.error('Failed to export project file.');
    }
  };
  const handleExportVideo = () => {
    toast.info('Rendering Engine Active', {
      description: 'The canvas is currently optimized for HD preview. Recording features are coming in the next update!',
    });
  };
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
          <DropdownMenuContent align="end" className="w-56 rounded-xl border-white/5 p-2">
            <DropdownMenuItem onClick={handleExportVideo} className="gap-3 text-xs font-bold py-2.5 rounded-lg cursor-pointer">
              <div className="w-7 h-7 rounded-md bg-purple-500/10 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-purple-500" />
              </div>
              Export as Video (HD)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSaveProject} className="gap-3 text-xs font-bold py-2.5 rounded-lg cursor-pointer">
              <div className="w-7 h-7 rounded-md bg-cyan-500/10 flex items-center justify-center">
                <FileJson className="w-3.5 h-3.5 text-cyan-500" />
              </div>
              Save Project File
            </DropdownMenuItem>
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