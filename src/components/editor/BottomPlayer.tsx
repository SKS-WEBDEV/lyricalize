import React, { useEffect, useCallback } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Loader2, Music, Maximize2 } from 'lucide-react';
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
  const isMuted = useEditorStore((s) => s.isMuted);
  const trackId = useEditorStore((s) => s.track?.id);
  const trackTitle = useEditorStore((s) => s.track?.title);
  const trackArtist = useEditorStore((s) => s.track?.artist);
  const trackAlbumArt = useEditorStore((s) => s.track?.albumArt);
  const setIsPlaying = useEditorStore((s) => s.setIsPlaying);
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime);
  const setIsMuted = useEditorStore((s) => s.setIsMuted);
  const togglePlay = useCallback(() => {
    if (trackId) setIsPlaying(!isPlaying);
  }, [trackId, isPlaying, setIsPlaying]);
  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted, setIsMuted]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
      if (e.code === 'ArrowRight') setCurrentTime(Math.min(currentTime + 5, duration));
      if (e.code === 'ArrowLeft') setCurrentTime(Math.max(currentTime - 5, 0));
      if (e.code === 'KeyM') toggleMute();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleMute, currentTime, duration, setCurrentTime]);
  const hasTrack = !!trackId;
  return (
    <div className="h-28 border-t bg-card/60 backdrop-blur-3xl px-6 md:px-12 flex items-center justify-between gap-6 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] relative z-30">
      {/* Track Info (Left) */}
      <div className="flex items-center gap-4 w-1/4 min-w-[200px]">
        <div className="w-14 h-14 rounded-xl bg-muted flex-shrink-0 overflow-hidden shadow-lg border border-white/5 relative group">
          {trackAlbumArt ? (
            <img src={trackAlbumArt} alt={trackTitle} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-transparent">
              <Music className="w-6 h-6 text-primary/30" />
            </div>
          )}
          {isBuffering && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate tracking-tight">{trackTitle ?? 'Not Playing'}</p>
          <p className="text-[10px] text-muted-foreground truncate uppercase font-black tracking-widest mt-0.5 opacity-60">
            {trackArtist ?? 'No Track Selected'}
          </p>
        </div>
      </div>
      {/* Timeline Controls (Center - Maximum width) */}
      <div className="flex-1 flex flex-col gap-2 max-w-4xl px-4">
        <div className="flex items-center gap-3 w-full">
          <span className="text-[10px] font-bold text-muted-foreground/60 w-10 text-right tabular-nums">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            disabled={!hasTrack}
            onValueChange={([v]) => setCurrentTime(v)}
            className="flex-1 h-1.5 cursor-pointer"
          />
          <span className="text-[10px] font-bold text-muted-foreground/60 w-10 tabular-nums">{formatTime(duration)}</span>
        </div>
      </div>
      {/* Utility Controls (Right) */}
      <div className="w-1/4 min-w-[200px] flex items-center justify-end gap-3 md:gap-6">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground/60 hover:text-primary transition-colors">
            <SkipBack className="w-4 h-4 fill-current" />
          </Button>
          <Button
            variant="default"
            size="icon"
            disabled={!hasTrack}
            className={cn(
              "w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95",
              hasTrack ? "bg-primary hover:bg-primary/90" : "opacity-20"
            )}
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground/60 hover:text-primary transition-colors">
            <SkipForward className="w-4 h-4 fill-current" />
          </Button>
        </div>
        <div className="h-6 w-px bg-white/10 mx-1" />
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleMute}
          className="h-9 w-9 text-muted-foreground/60 hover:text-primary transition-colors"
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-destructive" /> : <Volume2 className="w-5 h-5" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground/40 hover:text-primary transition-colors hidden md:flex">
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}