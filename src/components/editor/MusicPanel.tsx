import React, { useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { searchTracks, getBestMatchLyrics } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Search, Music, Play, Loader2, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useDebounceValue } from 'usehooks-ts';
import { Skeleton } from '@/components/ui/skeleton';
const POPULAR_SEARCHES = ['Shape of You', 'Blinding Lights', 'Night Changes', 'Perfect'];
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
      try {
        const results = await searchTracks(debouncedQuery);
        setSearchResults(results);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsSearching(false);
      }
    };
    fetchResults();
  }, [debouncedQuery, setIsSearching, setSearchResults]);
  const handleSelectTrack = async (track: any) => {
    setTrack(track);
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
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          placeholder="Find your track..."
          className="pl-10 h-11 bg-secondary/50 border-transparent focus:bg-background transition-all rounded-xl"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {!debouncedQuery && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground px-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Trending</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map(s => (
              <button 
                key={s} 
                onClick={() => setQuery(s)}
                className="px-3 py-1.5 rounded-full bg-secondary hover:bg-primary/10 hover:text-primary text-[11px] transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="space-y-3">
        {debouncedQuery && (
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between px-1">
            Results
            {isSearching && <Loader2 className="w-3 h-3 animate-spin" />}
          </h3>
        )}
        <div className="space-y-2 pb-4">
          {isSearching ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-secondary/20 rounded-xl">
                <Skeleton className="w-12 h-12 rounded-lg" />
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
                className={cn(
                  "p-3 flex items-center gap-3 cursor-pointer transition-all hover:bg-accent border-transparent group/card rounded-xl",
                  currentTrack?.id === track.id ? 'bg-primary/10 border-primary/30' : 'bg-secondary/30'
                )}
                onClick={() => handleSelectTrack(track)}
              >
                <div className="relative overflow-hidden rounded-lg shadow-sm">
                  <img src={track.albumArt} alt={track.title} className="w-12 h-12 object-cover transition-transform group-hover/card:scale-110" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/card:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="w-4 h-4 text-white fill-current" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate leading-tight">{track.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate uppercase tracking-tighter mt-0.5">{track.artist}</p>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
      {!isSearching && searchResults.length === 0 && query && (
        <div className="py-20 flex flex-col items-center gap-4 text-muted-foreground/40">
          <Music className="w-16 h-16 stroke-[1]" />
          <p className="text-xs font-medium">No tracks found for "{query}"</p>
        </div>
      )}
    </div>
  );
}