import React, { useEffect, useCallback } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { parseLRC } from '@/lib/lrcParser';
import { getLyricsOptions } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, FileText, CheckCircle2, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
export function LyricsPanel() {
  const rawLrc = useEditorStore((s) => s.rawLrc);
  const track = useEditorStore((s) => s.track);
  const lrcOptions = useEditorStore((s) => s.lrcOptions);
  const selectedLrcId = useEditorStore((s) => s.selectedLrcId);
  const setRawLrc = useEditorStore((s) => s.setRawLrc);
  const setLyrics = useEditorStore((s) => s.setLyrics);
  const setLrcOptions = useEditorStore((s) => s.setLrcOptions);
  const setSelectedLrcId = useEditorStore((s) => s.setSelectedLrcId);
  useEffect(() => {
    if (track) {
      const fetchLrcs = async () => {
        const options = await getLyricsOptions(track);
        setLrcOptions(options);
      };
      fetchLrcs();
    }
  }, [track?.id]);
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
  }, []);
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
                      ? "bg-primary/5 border-primary shadow-sm" 
                      : "bg-accent/30 border-transparent hover:bg-accent/50"
                  )}
                >
                  <CheckCircle2 className={cn("w-4 h-4", selectedLrcId === opt.id ? "text-emerald-500" : "text-muted-foreground/30")} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{opt.trackName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{opt.syncedLyrics ? 'Synced' : 'Plain'}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic px-2">No matching lyrics found on LRCLIB.</p>
            )}
          </div>
        </div>
      )}
      <div className="space-y-2">
        <Label>Custom LRC Editor</Label>
        <Textarea
          placeholder="[00:10.00] Enter lyrics with timestamps..."
          className="min-h-[200px] font-mono text-xs leading-relaxed bg-secondary/50"
          value={rawLrc}
          onChange={(e) => {
            setRawLrc(e.target.value);
            setLyrics(parseLRC(e.target.value));
          }}
        />
      </div>
      <div className="space-y-2">
        <Label>Upload File</Label>
        <div 
          {...getRootProps()} 
          className={cn(
            "p-6 border-2 border-dashed rounded-xl flex flex-col items-center gap-3 text-center transition-all cursor-pointer",
            isDragActive ? "border-primary bg-primary/5 scale-[0.98]" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30"
          )}
        >
          <input {...getInputProps()} />
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Drop .lrc here</p>
            <p className="text-xs text-muted-foreground mt-1">or click to browse files</p>
          </div>
        </div>
      </div>
    </div>
  );
}