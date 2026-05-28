import { create } from 'zustand';
export interface LyricLine {
  time: number;
  text: string;
}
export interface TypographyStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  fontWeight: string;
  lineHeight: number;
  textAlign: 'left' | 'center' | 'right';
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  glowColor: string;
  glowIntensity: number;
  textShadow: string;
  animationType: 'fade' | 'slide' | 'zoom' | 'blur';
}
export interface Track {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  duration: number;
  url?: string;
  downloadUrl?: Array<{ quality: string; url: string }>;
}
export interface LrcOption {
  id: number;
  trackName: string;
  artistName: string;
  albumName?: string;
  language?: string;
  syncedLyrics?: string;
  plainLyrics?: string;
}
interface EditorState {
  // Audio State
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isBuffering: boolean;
  experimentalDebugMode: boolean;
  // Track & Lyrics
  track: Track | null;
  lyrics: LyricLine[];
  rawLrc: string;
  lyricOffset: number; // in milliseconds
  // Search & Library
  isSearching: boolean;
  searchResults: Track[];
  lrcOptions: LrcOption[];
  selectedLrcId: number | null;
  // Design State
  style: TypographyStyle;
  // Actions
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setIsMuted: (isMuted: boolean) => void;
  setIsBuffering: (isBuffering: boolean) => void;
  setExperimentalDebugMode: (enabled: boolean) => void;
  setTrack: (track: Track | null) => void;
  setLyrics: (lyrics: LyricLine[]) => void;
  setRawLrc: (lrc: string) => void;
  setLyricOffset: (offset: number) => void;
  setIsSearching: (isSearching: boolean) => void;
  setSearchResults: (results: Track[]) => void;
  setLrcOptions: (options: LrcOption[]) => void;
  setSelectedLrcId: (id: number | null) => void;
  setStyle: (style: Partial<TypographyStyle>) => void;
}
export const useEditorStore = create<EditorState>((set) => ({
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  isBuffering: false,
  experimentalDebugMode: false,
  track: null,
  lyrics: [],
  rawLrc: '',
  lyricOffset: 0,
  isSearching: false,
  searchResults: [],
  lrcOptions: [],
  selectedLrcId: null,
  style: {
    fontFamily: 'Inter',
    fontSize: 48,
    color: '#ffffff',
    fontWeight: '700',
    lineHeight: 1.2,
    textAlign: 'center',
    textTransform: 'none',
    glowColor: '#8B5CF6',
    glowIntensity: 0,
    textShadow: '0px 0px 0px rgba(0,0,0,0)',
    animationType: 'fade',
  },
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  setIsMuted: (isMuted) => set({ isMuted }),
  setIsBuffering: (isBuffering) => set({ isBuffering }),
  setExperimentalDebugMode: (enabled) => set({ experimentalDebugMode: enabled }),
  setTrack: (track) => set({ track }),
  setLyrics: (lyrics) => set({ lyrics }),
  setRawLrc: (lrc) => set({ rawLrc: lrc }),
  setLyricOffset: (lyricOffset) => set({ lyricOffset }),
  setIsSearching: (isSearching) => set({ isSearching }),
  setSearchResults: (results) => set({ searchResults: results }),
  setLrcOptions: (options) => set({ lrcOptions: options }),
  setSelectedLrcId: (id) => set({ selectedLrcId: id }),
  setStyle: (newStyle) => set((state) => ({ style: { ...state.style, ...newStyle } })),
}));