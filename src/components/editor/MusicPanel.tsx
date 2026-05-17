import React, { useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { searchTracks, getBestMatchLyrics } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Search, Music, Play, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useDebounceValue } from 'usehooks-ts';
import { Skeleton } from '@/components/ui/skeleton';
export function MusicPanel() {
  const [query, setQuery] = React.useState('');
  const [debouncedQuery] = useDebounceValue(query, 500);
  const isSearching = useEditorStore((s) => s.isSearching);
  const searchResults = useEditorStore((s) => s.searchResults);
  const currentTrack = useEditorStore((s) => s.track);
  const setIsSearching = useEditorStore((s) => s.setIsSearching);
  const setSearchResults = useEditorStore((s) => s.setSearchResults);
  const setTrack = useEditorStore((s) => s.setTrack);
  const setRawLrc = useEditorStore((s) => s.setRawLrc);
  const setLyrics = useEditorStore((s) => s.setLyrics);
  useEffect(() => {
    if (!debouncedQuery) return;
    const fetchResults = async () => {
      setIsSearching(true);
      const results = await searchTracks(debouncedQuery);
      setSearchResults(results);
      setIsSearching(false);
    };
    fetchResults();
  }, [debouncedQuery]);
  const handleSelectTrack = async (track: any) => {
    setTrack(track);
    // Auto-fetch lyrics
    const match = await getBestMatchLyrics(track);
    if (match) {
      setRawLrc(match.raw);
      setLyrics(match.parsed);
    } else {
      setRawLrc('');
      setLyrics([]);
    }
  };
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
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
          Results
          {isSearching && <Loader2 className="w-3 h-3 animate-spin" />}
        </h3>
        <div className="space-y-2">
          {isSearching ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="w-12 h-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          ) : (
            searchResults.map((track) => (
              <Card
                key={track.id}
                className={`p-2 flex items-center gap-3 cursor-pointer transition-all hover:bg-accent border-transparent ${
                  currentTrack?.id === track.id ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/20' : ''
                }`}
                onClick={() => handleSelectTrack(track)}
              >
                <img src={track.albumArt} alt={track.title} className="w-12 h-12 rounded object-cover shadow-sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{track.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                </div>
                <div className="p-2 rounded-full bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 text-primary">
                  <Play className="w-3 h-3 fill-current" />
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
      {!isSearching && searchResults.length === 0 && (
        <div className="py-12 flex flex-col items-center gap-4 text-muted-foreground">
          <Music className="w-12 h-12 opacity-20" />
          <p className="text-sm">Search for your favorite tracks</p>
        </div>
      )}
    </div>
  );
}