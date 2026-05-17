import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
export function DesignPanel() {
  const fontFamily = useEditorStore((s) => s.style.fontFamily);
  const fontSize = useEditorStore((s) => s.style.fontSize);
  const fontWeight = useEditorStore((s) => s.style.fontWeight);
  const color = useEditorStore((s) => s.style.color);
  const lineHeight = useEditorStore((s) => s.style.lineHeight);
  const setStyle = useEditorStore((s) => s.setStyle);
  return (
    <ScrollArea className="h-full px-1">
      <div className="space-y-6 pb-8">
        <div className="space-y-4">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Typography</Label>
          <div className="space-y-2">
            <Label htmlFor="font-family">Font Family</Label>
            <Select value={fontFamily} onValueChange={(v) => setStyle({ fontFamily: v })}>
              <SelectTrigger id="font-family">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {FONTS.map((font) => (
                  <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                    {font.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="font-weight">Weight</Label>
            <Select value={fontWeight} onValueChange={(v) => setStyle({ fontWeight: v })}>
              <SelectTrigger id="font-weight">
                <SelectValue placeholder="Select weight" />
              </SelectTrigger>
              <SelectContent>
                {WEIGHTS.map((w) => (
                  <SelectItem key={w.value} value={w.value}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Separator />
        <div className="space-y-4">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sizing</Label>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Font Size</Label>
              <span className="text-xs font-mono text-muted-foreground">{fontSize}px</span>
            </div>
            <Slider 
              value={[fontSize]} 
              min={12} max={120} step={1} 
              onValueChange={([v]) => setStyle({ fontSize: v })} 
            />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Line Height</Label>
              <span className="text-xs font-mono text-muted-foreground">{lineHeight}</span>
            </div>
            <Slider 
              value={[lineHeight]} 
              min={0.8} max={2} step={0.1} 
              onValueChange={([v]) => setStyle({ lineHeight: v })} 
            />
          </div>
        </div>
        <Separator />
        <div className="space-y-4">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Colors</Label>
          <div className="space-y-2">
            <Label>Text Color</Label>
            <div className="flex gap-2 items-center">
              <div 
                className="w-10 h-10 rounded-md border border-input shadow-sm cursor-pointer"
                style={{ backgroundColor: color }}
              />
              <input 
                type="text" 
                value={color} 
                onChange={(e) => setStyle({ color: e.target.value })}
                className="flex-1 bg-secondary text-secondary-foreground border border-input h-10 px-3 rounded-md text-sm font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}