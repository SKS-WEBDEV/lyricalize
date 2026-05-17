import { Track, LyricLine } from '@/store/useEditorStore';
import { parseLRC } from './lrcParser';
const SAAVN_API_BASE = 'https://saavn.dev/api';
const LRCLIB_API_BASE = 'https://lrclib.net/api';
export interface LrcOption {
  id: number;
  name: string;
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number;
  syncedLyrics?: string;
  plainLyrics?: string;
}
export async function searchTracks(query: string): Promise<Track[]> {
  try {
    const response = await fetch(`${SAAVN_API_BASE}/search/songs?query=${encodeURIComponent(query)}&limit=15`);
    const result = await response.json();
    if (!result.success || !result.data.results) return [];
    return result.data.results.map((song: any) => ({
      id: song.id,
      title: song.name,
      artist: song.artists.primary.map((a: any) => a.name).join(', '),
      albumArt: song.image[song.image.length - 1].url, // Highest resolution
      duration: song.duration,
      url: song.downloadUrl[song.downloadUrl.length - 1].url, // Highest bitrate
    }));
  } catch (error) {
    console.error('Saavn Search Error:', error);
    return [];
  }
}
export async function getLyricsOptions(track: Track): Promise<LrcOption[]> {
  try {
    const query = `track_name=${encodeURIComponent(track.title)}&artist_name=${encodeURIComponent(track.artist)}`;
    const response = await fetch(`${LRCLIB_API_BASE}/search?${query}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('LRCLIB Search Error:', error);
    return [];
  }
}
export async function getBestMatchLyrics(track: Track): Promise<{ raw: string; parsed: LyricLine[] } | null> {
  try {
    const query = `track_name=${encodeURIComponent(track.title)}&artist_name=${encodeURIComponent(track.artist)}&duration=${track.duration}`;
    const response = await fetch(`${LRCLIB_API_BASE}/get?${query}`);
    if (!response.ok) return null;
    const data = await response.json();
    const raw = data.syncedLyrics || data.plainLyrics || '';
    return {
      raw,
      parsed: parseLRC(raw),
    };
  } catch (error) {
    console.error('LRCLIB Best Match Error:', error);
    return null;
  }
}