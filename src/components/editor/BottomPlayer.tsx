import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, Loader2, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
export function BottomPlayer() {
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const isBuffering = useEditorStore((s) => s.isBuffering);
  const currentTime = useEditorStore((s) => s.currentTime);
  const duration = useEditorStore((s) => s.duration);
  const volume = useEditorStore((s) => s.volume);
  const track = useEditorStore((s) => s.track);
  const setIsPlaying = useEditorStore((s) => s.setIsPlaying);
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime);
  const setVolume = useEditorStore((s) => s.setVolume);
  return (
    <div className="h-24 border-t bg-card/80 backdrop-blur-md px-6 flex items-center gap-6 shadow-2xl relative z-20">
      <div className="flex items-center gap-4 w-72">
        <div className="w-14 h-14 rounded-lg bg-muted flex-shrink-0 overflow-hidden shadow-inner border border-white/5 relative group">
          {track?.albumArt ? (
            <img src={track.albumArt} alt={track.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/5">
              <Music className="w-6 h-6 text-primary/20" />
            </div>
          )}
          {isBuffering && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">{track?.title ?? 'Ready to search?'}</p>
          <p className="text-xs text-muted-foreground truncate">{track?.artist ?? 'Select a song to begin'}</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-2 max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <SkipBack className="w-5 h-5" />
          </Button>
          <Button
            variant="default"
            size="icon"
            disabled={!track}
            className={cn(
              "w-12 h-12 rounded-full shadow-lg transition-all active:scale-95",
              track ? "bg-primary hover:scale-105" : "opacity-50"
            )}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isBuffering ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex items-center gap-3 w-full">
          <span className="text-[10px] font-mono text-muted-foreground w-10 text-right">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            disabled={!track}
            onValueChange={([v]) => setCurrentTime(v)}
            className="flex-1"
          />
          <span className="text-[10px] font-mono text-muted-foreground w-10">{formatTime(duration)}</span>
        </div>
      </div>
      <div className="flex items-center gap-4 w-72 justify-end">
        <Volume2 className="w-4 h-4 text-muted-foreground" />
        <Slider 
          value={[volume * 100]} 
          max={100} 
          step={1} 
          onValueChange={([v]) => setVolume(v / 100)}
          className="w-24" 
        />
      </div>
    </div>
  );
}