import React, { useEffect, useCallback } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, Loader2, Music, Maximize2 } from 'lucide-react';
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
  const togglePlay = useCallback(() => {
    if (track) setIsPlaying(!isPlaying);
  }, [track, isPlaying, setIsPlaying]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
      if (e.code === 'ArrowRight') setCurrentTime(Math.min(currentTime + 5, duration));
      if (e.code === 'ArrowLeft') setCurrentTime(Math.max(currentTime - 5, 0));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, currentTime, duration, setCurrentTime]);
  return (
    <div className="h-28 border-t bg-card/40 backdrop-blur-3xl px-8 flex items-center gap-8 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] relative z-30">
      <div className="flex items-center gap-5 w-80">
        <div className="w-16 h-16 rounded-2xl bg-muted flex-shrink-0 overflow-hidden shadow-2xl border border-white/5 relative group perspective-1000">
          {track?.albumArt ? (
            <img src={track.albumArt} alt={track.title} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-125" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-transparent">
              <Music className="w-7 h-7 text-primary/30" />
            </div>
          )}
          {isBuffering && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black tracking-tight truncate">{track?.title ?? 'Ready for Music?'}</p>
          <p className="text-[10px] text-muted-foreground truncate uppercase tracking-widest font-bold mt-1 opacity-70">
            {track?.artist ?? 'Select a masterpiece'}
          </p>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-3 max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-6">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary transition-colors">
            <SkipBack className="w-5 h-5 fill-current" />
          </Button>
          <Button
            variant="default"
            size="icon"
            disabled={!track}
            className={cn(
              "w-14 h-14 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-300 hover:scale-110 active:scale-90",
              track ? "bg-primary hover:bg-primary/90" : "opacity-30"
            )}
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-1" />
            )}
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary transition-colors">
            <SkipForward className="w-5 h-5 fill-current" />
          </Button>
        </div>
        <div className="flex items-center gap-4 w-full">
          <span className="text-[10px] font-black text-muted-foreground w-12 text-right tabular-nums">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            disabled={!track}
            onValueChange={([v]) => setCurrentTime(v)}
            className="flex-1"
          />
          <span className="text-[10px] font-black text-muted-foreground w-12 tabular-nums">{formatTime(duration)}</span>
        </div>
      </div>
      <div className="flex items-center gap-5 w-80 justify-end">
        <Volume2 className="w-4 h-4 text-muted-foreground/60" />
        <Slider
          value={[volume * 100]}
          max={100}
          step={1}
          onValueChange={([v]) => setVolume(v / 100)}
          className="w-24"
        />
        <Button variant="ghost" size="icon" className="text-muted-foreground/40 hover:text-primary transition-colors">
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}