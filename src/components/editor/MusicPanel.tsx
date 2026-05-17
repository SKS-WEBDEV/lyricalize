import React, { useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Input } from '@/components/ui/input';
import { Search, Music, Play } from 'lucide-react';
import { Card } from '@/components/ui/card';
const MOCK_RESULTS = [
  { id: '1', title: 'Midnight City', artist: 'M83', albumArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&h=100&fit=crop' },
  { id: '2', title: 'Starboy', artist: 'The Weeknd', albumArt: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=100&h=100&fit=crop' },
  { id: '3', title: 'Levitating', artist: 'Dua Lipa', albumArt: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=100&h=100&fit=crop' },
];
export function MusicPanel() {
  const [query, setQuery] = useState('');
  const setTrack = useEditorStore((s) => s.setTrack);
  const currentTrack = useEditorStore((s) => s.track);
  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search for a song..." 
          className="pl-10"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Results</h3>
        <div className="space-y-2">
          {MOCK_RESULTS.map((track) => (
            <Card 
              key={track.id}
              className={`p-2 flex items-center gap-3 cursor-pointer transition-all hover:bg-accent ${currentTrack?.id === track.id ? 'border-primary ring-1 ring-primary' : 'border-transparent'}`}
              onClick={() => setTrack({ ...track, duration: 180 })}
            >
              <img src={track.albumArt} alt={track.title} className="w-12 h-12 rounded object-cover shadow-sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{track.title}</p>
                <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
              </div>
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Play className="w-3 h-3 fill-current" />
              </div>
            </Card>
          ))}
        </div>
      </div>
      {MOCK_RESULTS.length === 0 && (
        <div className="py-12 flex flex-col items-center gap-4 text-muted-foreground">
          <Music className="w-12 h-12 opacity-20" />
          <p className="text-sm">Search to find your tracks</p>
        </div>
      )}
    </div>
  );
}