import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Move, Type, Clock, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
const FONTS = [
  { name: 'Inter', value: 'Inter' },
  { name: 'Playfair Display', value: 'Playfair Display' },
  { name: 'Fredericka the Great', value: 'Fredericka the Great' },
  { name: 'Great Vibes', value: 'Great Vibes' },
  { name: 'JetBrains Mono', value: 'JetBrains Mono' },
];
const WEIGHTS = [
  { name: 'Light', value: '300' },
  { name: 'Normal', value: '400' },
  { name: 'Medium', value: '500' },
  { name: 'Bold', value: '700' },
  { name: 'Black', value: '900' },
];
const ANIMATIONS = [
  { name: 'Fade In', value: 'fade' },
  { name: 'Slide Up', value: 'slide' },
  { name: 'Scale Zoom', value: 'zoom' },
  { name: 'Dreamy Blur', value: 'blur' },
];
const PRESET_COLORS = ['#ffffff', '#8B5CF6', '#06B6D4', '#F43F5E', '#10B981', '#F59E0B'];
export function DesignPanel() {
  const fontFamily = useEditorStore((s) => s.style.fontFamily);
  const fontSize = useEditorStore((s) => s.style.fontSize);
  const fontWeight = useEditorStore((s) => s.style.fontWeight);
  const glowColor = useEditorStore((s) => s.style.glowColor);
  const glowIntensity = useEditorStore((s) => s.style.glowIntensity);
  const animationType = useEditorStore((s) => s.style.animationType);
  const lyricOffset = useEditorStore((s) => s.lyricOffset);
  const setStyle = useEditorStore((s) => s.setStyle);
  const setLyricOffset = useEditorStore((s) => s.setLyricOffset);
  return (
    <ScrollArea className="h-[calc(100vh-180px)] pr-4">
      <div className="space-y-8 pb-12">
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Type className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Typography</span>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select value={fontFamily} onValueChange={(v) => setStyle({ fontFamily: v })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {FONTS.map((f) => (
                    <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Weight</Label>
                <Select value={fontWeight} onValueChange={(v) => setStyle({ fontWeight: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {WEIGHTS.map((w) => <SelectItem key={w.value} value={w.value}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Size ({fontSize}px)</Label>
                <Slider value={[fontSize]} min={20} max={120} step={1} onValueChange={([v]) => setStyle({ fontSize: v })} />
              </div>
            </div>
          </div>
        </section>
        <Separator className="opacity-50" />
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Timing & Sync</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-[10px] w-48">Adjust if lyrics are early or late. Positive values delay lyrics, negative values advance them.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <Label className="flex-1">Offset (ms)</Label>
              <Input 
                type="number" 
                value={lyricOffset} 
                onChange={(e) => setLyricOffset(parseInt(e.target.value) || 0)}
                className="w-24 h-8 text-xs text-center rounded-lg"
              />
            </div>
            <Slider 
              value={[lyricOffset]} 
              min={-5000} 
              max={5000} 
              step={50} 
              onValueChange={([v]) => setLyricOffset(v)} 
            />
          </div>
        </section>
        <Separator className="opacity-50" />
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Aesthetics</span>
          </div>
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Glow Intensity ({glowIntensity}px)</Label>
              <Slider value={[glowIntensity]} min={0} max={40} step={1} onValueChange={([v]) => setStyle({ glowIntensity: v })} />
            </div>
            <div className="space-y-2">
              <Label>Preset Colors</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((pc) => (
                  <button
                    key={pc}
                    onClick={() => setStyle({ color: pc, glowColor: pc })}
                    className="w-8 h-8 rounded-full border-2 border-background shadow-sm hover:scale-110 transition-transform"
                    style={{ backgroundColor: pc }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
        <Separator className="opacity-50" />
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Move className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Motion</span>
          </div>
          <div className="space-y-2">
            <Label>Transition Style</Label>
            <div className="grid grid-cols-2 gap-2">
              {ANIMATIONS.map((anim) => (
                <button
                  key={anim.value}
                  onClick={() => setStyle({ animationType: anim.value as any })}
                  className={`p-3 text-[10px] uppercase tracking-tighter rounded-xl border transition-all ${
                    animationType === anim.value
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-105'
                    : 'bg-secondary hover:bg-accent border-transparent'
                  }`}
                >
                  {anim.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </ScrollArea>
  );
}