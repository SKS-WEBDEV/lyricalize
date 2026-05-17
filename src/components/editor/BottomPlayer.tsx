import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
export function BottomPlayer() {
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const currentTime = useEditorStore((s) => s.currentTime);
  const duration = useEditorStore((s) => s.duration);
  const track = useEditorStore((s) => s.track);
  const setIsPlaying = useEditorStore((s) => s.setIsPlaying);
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime);
  return (
    <div className="h-24 border-t bg-card/80 backdrop-blur-md px-6 flex items-center gap-6 shadow-2xl relative z-20">
      <div className="flex items-center gap-4 w-72">
        <div className="w-14 h-14 rounded-lg bg-muted flex-shrink-0 overflow-hidden shadow-inner border border-white/5">
          {track?.albumArt ? (
            <img src={track.albumArt} alt={track.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/5">
              <Music className="w-6 h-6 text-primary/20" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">{track?.title ?? 'No Track Selected'}</p>
          <p className="text-xs text-muted-foreground truncate">{track?.artist ?? 'Select a song to start'}</p>
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
            className="w-10 h-10 rounded-full shadow-lg hover:scale-105 transition-transform"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex items-center gap-3 w-full">
          <span className="text-[10px] font-mono text-muted-foreground w-10 text-right">{formatTime(currentTime)}</span>
          <Slider 
            value={[currentTime]} 
            max={duration} 
            step={0.1}
            onValueChange={([v]) => setCurrentTime(v)}
            className="flex-1"
          />
          <span className="text-[10px] font-mono text-muted-foreground w-10">{formatTime(duration)}</span>
        </div>
      </div>
      <div className="flex items-center gap-4 w-72 justify-end">
        <Volume2 className="w-4 h-4 text-muted-foreground" />
        <Slider defaultValue={[80]} max={100} step={1} className="w-24" />
      </div>
    </div>
  );
}
// Internal icon dependency for fallback
function Music({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
    </svg>
  );
}