import React, { useEffect, useCallback, useMemo } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { parseLRC } from '@/lib/lrcParser';
import { getLyricsOptions } from '@/lib/api';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, CheckCircle2, Search, Zap, Globe, Disc, Music } from 'lucide-react';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
export function LyricsPanel() {
  const rawLrc = useEditorStore((s) => s.rawLrc);
  const currentTime = useEditorStore((s) => s.currentTime);
  const lyrics = useEditorStore((s) => s.lyrics);
  const lrcOptions = useEditorStore((s) => s.lrcOptions);
  const selectedLrcId = useEditorStore((s) => s.selectedLrcId);
  const trackId = useEditorStore((s) => s.track?.id);
  const trackTitle = useEditorStore((s) => s.track?.title);
  const trackArtist = useEditorStore((s) => s.track?.artist);
  const trackDuration = useEditorStore((s) => s.track?.duration);
  const setRawLrc = useEditorStore((s) => s.setRawLrc);
  const setLyrics = useEditorStore((s) => s.setLyrics);
  const setLrcOptions = useEditorStore((s) => s.setLrcOptions);
  const setSelectedLrcId = useEditorStore((s) => s.setSelectedLrcId);
  useEffect(() => {
    if (trackId && trackTitle && trackArtist) {
      const fetchLrcs = async () => {
        try {
          const trackObj = { 
            id: trackId, 
            title: trackTitle, 
            artist: trackArtist, 
            albumArt: '', 
            duration: trackDuration ?? 0 
          };
          const options = await getLyricsOptions(trackObj);
          setLrcOptions(options);
        } catch (error) {
          console.error("Failed to fetch lyrics options", error);
        }
      };
      fetchLrcs();
    }
  }, [trackId, trackTitle, trackArtist, trackDuration, setLrcOptions]);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawLrc(content);
      setLyrics(parseLRC(content));
      setSelectedLrcId(null);
      toast.success('LRC file uploaded and parsed!');
    };
    reader.readAsText(file);
  }, [setLyrics, setRawLrc, setSelectedLrcId]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.lrc'] },
    multiple: false
  });
  const handleLrcSelect = (option: any) => {
    setSelectedLrcId(option.id);
    const content = option.syncedLyrics || option.plainLyrics || '';
    setRawLrc(content);
    setLyrics(parseLRC(content));
    toast.success(`Synced to ${option.artistName}'s lyrics`);
  };
  const activeLineIndex = useMemo(() => {
    let idx = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (lyrics[i].time <= currentTime) idx = i;
      else break;
    }
    return idx;
  }, [lyrics, currentTime]);
  return (
    <ScrollArea className="h-[calc(100vh-180px)] pr-4">
      <div className="space-y-8 pb-12">
        {trackId && (
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <Search className="w-3 h-3" /> LRCLIB Results
            </Label>
            <div className="space-y-2">
              {lrcOptions.length > 0 ? (
                lrcOptions.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => handleLrcSelect(opt)}
                    className={cn(
                      "p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 group",
                      selectedLrcId === opt.id
                        ? "bg-primary/10 border-primary shadow-sm"
                        : "bg-secondary/30 border-transparent hover:bg-accent/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold truncate group-hover:text-primary transition-colors">{opt.trackName}</p>
                      {selectedLrcId === opt.id && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                        <Disc className="w-3 h-3" /> {opt.albumName || 'Unknown Album'}
                      </div>
                      {opt.language && (
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                          <Globe className="w-3 h-3" /> {opt.language}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-500 uppercase tracking-tighter">
                        {opt.syncedLyrics ? 'Synced LRC' : 'Static Text'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center bg-secondary/20 rounded-2xl border border-dashed border-muted-foreground/20">
                  <Music className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-[11px] text-muted-foreground italic px-4 leading-relaxed">
                    No matching lyrics found on LRCLIB. Try manual entry or file upload.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="space-y-3 relative">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Custom LRC Editor</Label>
            {activeLineIndex !== -1 && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-bold text-primary animate-pulse">
                <Zap className="w-2.5 h-2.5 fill-current" />
                LIVE
              </div>
            )}
          </div>
          <Textarea
            placeholder="[00:10.00] Enter lyrics with timestamps..."
            className="min-h-[200px] font-mono text-[11px] leading-relaxed bg-secondary/30 focus-visible:ring-primary/30 rounded-xl"
            value={rawLrc}
            onChange={(e) => {
              setRawLrc(e.target.value);
              setLyrics(parseLRC(e.target.value));
              setSelectedLrcId(null);
            }}
          />
        </div>
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Import File</Label>
          <div
            {...getRootProps()}
            className={cn(
              "p-8 border-2 border-dashed rounded-2xl flex flex-col items-center gap-3 text-center transition-all cursor-pointer group",
              isDragActive ? "border-primary bg-primary/5 scale-[0.98]" : "border-muted-foreground/20 hover:border-primary/40 hover:bg-accent/30"
            )}
          >
            <input {...getInputProps()} />
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center transition-transform group-hover:rotate-12 group-hover:scale-110">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">Drop .lrc here</p>
              <p className="text-[11px] text-muted-foreground mt-1">LRC files only supported</p>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}