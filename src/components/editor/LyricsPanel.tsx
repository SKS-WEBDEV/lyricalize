import React, { useEffect, useCallback, useMemo } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { parseLRC } from '@/lib/lrcParser';
import { getLyricsOptions } from '@/lib/api';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, FileText, CheckCircle2, Search, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
export function LyricsPanel() {
  const rawLrc = useEditorStore((s) => s.rawLrc);
  const track = useEditorStore((s) => s.track);
  const lyrics = useEditorStore((s) => s.lyrics);
  const currentTime = useEditorStore((s) => s.currentTime);
  const lrcOptions = useEditorStore((s) => s.lrcOptions);
  const selectedLrcId = useEditorStore((s) => s.selectedLrcId);
  const setRawLrc = useEditorStore((s) => s.setRawLrc);
  const setLyrics = useEditorStore((s) => s.setLyrics);
  const setLrcOptions = useEditorStore((s) => s.setLrcOptions);
  const setSelectedLrcId = useEditorStore((s) => s.setSelectedLrcId);
  useEffect(() => {
    if (track) {
      const fetchLrcs = async () => {
        try {
          const options = await getLyricsOptions(track);
          setLrcOptions(options);
        } catch (error) {
          console.error("Failed to fetch lyrics options", error);
        }
      };
      fetchLrcs();
    }
  }, [track, setLrcOptions]);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawLrc(content);
      setLyrics(parseLRC(content));
      toast.success('LRC file uploaded and parsed!');
    };
    reader.readAsText(file);
  }, [setLyrics, setRawLrc]);
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
    <div className="space-y-6 pb-8">
      {track && (
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Search className="w-3 h-3" /> Auto-Synced Results
          </Label>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {lrcOptions.length > 0 ? (
              lrcOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => handleLrcSelect(opt)}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3",
                    selectedLrcId === opt.id
                      ? "bg-primary/10 border-primary shadow-sm"
                      : "bg-accent/30 border-transparent hover:bg-accent/50"
                  )}
                >
                  <CheckCircle2 className={cn("w-4 h-4", selectedLrcId === opt.id ? "text-primary" : "text-muted-foreground/30")} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{opt.trackName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{opt.syncedLyrics ? 'Synced' : 'Plain Text'}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic px-2">No matching lyrics found on LRCLIB.</p>
            )}
          </div>
        </div>
      )}
      <div className="space-y-2 relative">
        <div className="flex items-center justify-between">
          <Label>Custom LRC Editor</Label>
          {activeLineIndex !== -1 && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-bold text-primary animate-pulse">
              <Zap className="w-2.5 h-2.5 fill-current" />
              LIVE SYNC
            </div>
          )}
        </div>
        <Textarea
          placeholder="[00:10.00] Enter lyrics with timestamps..."
          className="min-h-[200px] font-mono text-[11px] leading-relaxed bg-secondary/30 focus-visible:ring-primary/30"
          value={rawLrc}
          onChange={(e) => {
            setRawLrc(e.target.value);
            setLyrics(parseLRC(e.target.value));
          }}
        />
      </div>
      <div className="space-y-2">
        <Label>Import File</Label>
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
  );
}