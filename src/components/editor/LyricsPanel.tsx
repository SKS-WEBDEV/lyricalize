import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { parseLRC } from '@/lib/lrcParser';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
export function LyricsPanel() {
  const rawLrc = useEditorStore((s) => s.rawLrc);
  const setRawLrc = useEditorStore((s) => s.setRawLrc);
  const setLyrics = useEditorStore((s) => s.setLyrics);
  const handleLrcChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawLrc(val);
    const parsed = parseLRC(val);
    setLyrics(parsed);
  };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawLrc(content);
      setLyrics(parseLRC(content));
      toast.success('LRC file uploaded and parsed!');
    };
    reader.readAsText(file);
  };
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sync Source</Label>
        <div className="p-3 bg-accent/50 rounded-lg border border-accent flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">LRCLIB Sync #1</p>
            <p className="text-xs text-muted-foreground">Accuracy: High</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Custom LRC Editor</Label>
        <Textarea 
          placeholder="[00:10.00] Enter lyrics with timestamps..."
          className="min-h-[250px] font-mono text-xs leading-relaxed"
          value={rawLrc}
          onChange={handleLrcChange}
        />
      </div>
      <div className="space-y-2">
        <Label>Upload File</Label>
        <div className="relative">
          <input 
            type="file" 
            accept=".lrc" 
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Button variant="outline" className="w-full flex gap-2">
            <Upload className="w-4 h-4" />
            Upload .lrc File
          </Button>
        </div>
      </div>
      <div className="p-4 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/20 flex flex-col items-center gap-2 text-center">
        <FileText className="w-8 h-8 text-muted-foreground/40" />
        <p className="text-xs text-muted-foreground">Drag and drop your .lrc file here to sync automatically.</p>
      </div>
    </div>
  );
}