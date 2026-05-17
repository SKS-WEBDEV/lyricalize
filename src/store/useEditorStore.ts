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
}
export interface Track {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  duration: number;
  url?: string;
}
interface EditorState {
  // Audio State
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  // Track & Lyrics
  track: Track | null;
  lyrics: LyricLine[];
  rawLrc: string;
  // Design State
  style: TypographyStyle;
  // Actions
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setTrack: (track: Track | null) => void;
  setLyrics: (lyrics: LyricLine[]) => void;
  setRawLrc: (lrc: string) => void;
  setStyle: (style: Partial<TypographyStyle>) => void;
}
export const useEditorStore = create<EditorState>((set) => ({
  isPlaying: false,
  currentTime: 0,
  duration: 180, // Default 3 mins for mock
  track: {
    id: '1',
    title: 'Midnight City',
    artist: 'M83',
    albumArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop',
    duration: 243,
  },
  lyrics: [
    { time: 0, text: "Waiting in a car" },
    { time: 5, text: "Waiting for a ride in the dark" },
    { time: 10, text: "At night the city grows" },
    { time: 15, text: "Look at the horizon burn" },
    { time: 20, text: "He's coming..." },
  ],
  rawLrc: "[00:00.00]Waiting in a car\n[00:05.00]Waiting for a ride in the dark\n[00:10.00]At night the city grows\n[00:15.00]Look at the horizon burn\n[00:20.00]He's coming...",
  style: {
    fontFamily: 'Inter',
    fontSize: 48,
    color: '#ffffff',
    fontWeight: '700',
    lineHeight: 1.2,
    textAlign: 'center',
    textTransform: 'none',
  },
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setTrack: (track) => set({ track }),
  setLyrics: (lyrics) => set({ lyrics }),
  setRawLrc: (lrc) => set({ rawLrc: lrc }),
  setStyle: (newStyle) => set((state) => ({ style: { ...state.style, ...newStyle } })),
}));