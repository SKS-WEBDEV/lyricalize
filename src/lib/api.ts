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
      const rawDownloadUrl = song.downloadUrl;
      
      // Process downloadUrl with enhanced debugging
      let downloadUrls: Array<{ quality: string; url: string }> = [];
      
      if (Array.isArray(rawDownloadUrl)) {
        downloadUrls = rawDownloadUrl;
      } else if (rawDownloadUrl && typeof rawDownloadUrl === 'object') {
        downloadUrls = Object.values(rawDownloadUrl) as any[];
      }
      
      // Ensure all entries have valid quality and url
      const validDownloadUrls = downloadUrls.filter(
        (d: any) => d?.url && d?.quality
      );

      if (!validDownloadUrls.length) {
        console.warn(`[searchTracks] Song ${song.id} has no valid downloadUrl entries`, {
          rawCount: downloadUrls.length,
          song: { id: song.id, name: song.name }
        });
      }

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
        url: song.url, // JioSaavn page link (for reference)
        downloadUrl: validDownloadUrls,
      };
    });
  } catch (error) {
    console.error('Saavn Search Error:', safeError(error));
    return [];
  }
}

export async function getLyricsOptions(track: Track): Promise<LrcOption[]> {
  const buildSearchUrl = (query: string) => `${LRCLIB_API_BASE}/search?${query}`;

  const searchTrack = async (query: string) => {
    const response = await fetch(buildSearchUrl(query));
    if (!response.ok) {
      throw new Error(`LRCLIB /search failed: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  };

  try {
    const query = `track_name=${encodeURIComponent(track.title)}&artist_name=${encodeURIComponent(track.artist)}`;
    let data = await searchTrack(query);

    if (!data.length) {
      const fallbackQuery = `q=${encodeURIComponent(`${track.title} ${track.artist}`)}`;
      data = await searchTrack(fallbackQuery);
    }

    return data.slice(0, 15).map((item: any, index: number) => ({
      id: Number(item.id) || index,
      name: item.trackName || item.title || track.title,
      trackName: item.trackName || track.title,
      artistName: item.artistName || track.artist,
      albumName: item.albumName || 'Unknown Album',
      duration: Number(item.duration) || track.duration || 0,
      syncedLyrics: item.syncedLyrics,
      plainLyrics: item.plainLyrics,
    }));
  } catch (error) {
    console.error('LRCLIB Search Error:', safeError(error));
    return [];
  }
}

export async function getBestMatchLyrics(track: Track): Promise<{ raw: string; parsed: LyricLine[] } | null> {
  try {
    const candidates = await getLyricsOptions(track);
    if (candidates.length === 0) return null;

    const bestMatch =
      candidates.find((item) => item.syncedLyrics && item.artistName?.toLowerCase().includes(track.artist.toLowerCase())) ||
      candidates.find((item) => item.syncedLyrics) ||
      candidates[0];

    const raw = bestMatch.syncedLyrics || bestMatch.plainLyrics || '';
    return {
      raw,
      parsed: parseLRC(raw),
    };
  } catch (error) {
    console.error('LRCLIB Best Match Error:', safeError(error));
    return null;
  }
}
