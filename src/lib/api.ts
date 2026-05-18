import { Track, LyricLine } from '@/store/useEditorStore';
import { parseLRC } from './lrcParser';
import { safeError } from './utils';

const SAAVN_API_BASE = 'https://zylaes-saavn.vercel.app/api';
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
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();

    // The zylaes-saavn API returns songs nested in data.results
    const songs = result.data?.results || result.data || [];
    if (!Array.isArray(songs)) return [];

    return songs.map((song: any) => {
      const downloadUrls = Array.isArray(song.downloadUrl) ? song.downloadUrl : [];

      return {
        id: song.id,
        title: song.name,
        artist: Array.isArray(song.artists?.primary)
          ? song.artists.primary.map((a: any) => a.name).join(', ')
          : (song.artist || 'Unknown Artist'),
        albumArt: Array.isArray(song.image)
          ? song.image[song.image.length - 1]?.url
          : song.image || '',
        duration: Number(song.duration) || 0,
        // url is intentionally omitted — the audio engine resolves
        // the stream URL directly from downloadUrl[] at playback time.
        downloadUrl: downloadUrls.map((d: any) => ({ quality: d?.quality, url: d?.url })),
      };
    });
  } catch (error) {
    console.error('Saavn Search Error:', safeError(error));
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
    console.error('LRCLIB Search Error:', safeError(error));
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
    console.error('LRCLIB Best Match Error:', safeError(error));
    return null;
  }
}
