import { useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { toast } from 'sonner';
import { safeError } from '@/lib/utils';
export function useAudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const frameRef = useRef<number>(0);
  // High-frequency values are tracked in refs to avoid reactive dependency loops
  const syncStateRef = useRef({ 
    currentTime: 0, 
    isPlaying: false,
    duration: 0
  });
  // Access actions directly from store for non-reactive use
  const { 
    setIsPlaying, 
    setCurrentTime, 
    setDuration, 
    setIsBuffering 
  } = useEditorStore.getState();
  // Initialization: Setup audio element and event listeners
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;
    const onPlay = () => {
      syncStateRef.current.isPlaying = true;
      useEditorStore.getState().setIsPlaying(true);
    };
    const onPause = () => {
      syncStateRef.current.isPlaying = false;
      useEditorStore.getState().setIsPlaying(false);
    };
    const onEnded = () => {
      syncStateRef.current.isPlaying = false;
      useEditorStore.getState().setIsPlaying(false);
      useEditorStore.getState().setCurrentTime(0);
    };
    const onLoadedMetadata = () => {
      const d = audio.duration;
      syncStateRef.current.duration = d;
      useEditorStore.getState().setDuration(d);
      useEditorStore.getState().setIsBuffering(false);
    };
    const onWaiting = () => useEditorStore.getState().setIsBuffering(true);
    const onPlaying = () => useEditorStore.getState().setIsBuffering(false);
    const onError = () => {
      const currentSrc = audio.getAttribute('src');
      if (!currentSrc || currentSrc === "" || currentSrc === window.location.href) return;
      const error = audio.error;
      let message = 'Audio playback error';
      if (error?.code === 4 || error?.code === 3) {
        message = 'Track unavailable or format not supported';
      } else if (error?.code === 2) {
        message = 'Network error during playback';
      }
      console.warn('Audio Engine Notice:', safeError({
        code: error?.code,
        message: error?.message || 'Media Error',
        src: currentSrc
      }));
      toast.error(message);
      useEditorStore.getState().setIsPlaying(false);
      useEditorStore.getState().setIsBuffering(false);
    };
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('error', onError);
    // Sync Loop: Decoupled from React Render Cycle
    const update = () => {
      const a = audioRef.current;
      if (a && syncStateRef.current.isPlaying && a.getAttribute('src')) {
        const audioTime = a.currentTime;
        // Only update store if there is a meaningful drift to prevent micro-render loops
        if (Math.abs(audioTime - syncStateRef.current.currentTime) > 0.05) {
          syncStateRef.current.currentTime = audioTime;
          useEditorStore.getState().setCurrentTime(audioTime);
        }
      }
      frameRef.current = requestAnimationFrame(update);
    };
    frameRef.current = requestAnimationFrame(update);
    return () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('error', onError);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);
  // Track & Source Subscription
  useEffect(() => {
    return useEditorStore.subscribe(
      (state) => state.track?.url,
      (url) => {
        const audio = audioRef.current;
        if (!audio) return;
        if (url) {
          useEditorStore.getState().setIsBuffering(true);
          audio.src = url;
          audio.load();
          // If was playing, auto-resume
          if (useEditorStore.getState().isPlaying) {
            audio.play().catch(() => {});
          }
        } else {
          audio.pause();
          audio.removeAttribute('src');
          useEditorStore.getState().setIsPlaying(false);
          useEditorStore.getState().setIsBuffering(false);
        }
      }
    );
  }, []);
  // Playback Control Subscription
  useEffect(() => {
    return useEditorStore.subscribe(
      (state) => state.isPlaying,
      (playing) => {
        const audio = audioRef.current;
        if (!audio || !audio.getAttribute('src')) return;
        if (playing && audio.paused) {
          audio.play().catch((err) => {
            if (err.name !== 'AbortError') {
              console.error('Play request failed:', safeError(err));
              useEditorStore.getState().setIsPlaying(false);
            }
          });
        } else if (!playing && !audio.paused) {
          audio.pause();
        }
      }
    );
  }, []);
  // Volume & Mute Subscription
  useEffect(() => {
    return useEditorStore.subscribe(
      (state) => ({ volume: state.volume, isMuted: state.isMuted }),
      ({ volume, isMuted }) => {
        if (audioRef.current) {
          audioRef.current.volume = volume;
          audioRef.current.muted = isMuted;
        }
      }
    );
  }, []);
  // Manual Seek Subscription
  useEffect(() => {
    return useEditorStore.subscribe(
      (state) => state.currentTime,
      (time) => {
        const audio = audioRef.current;
        if (!audio || !audio.getAttribute('src')) return;
        // Only seek if the drift is large (user interaction/seek)
        // This prevents the sync loop from fighting with the manual seek
        if (Math.abs(audio.currentTime - time) > 1.2) {
          audio.currentTime = time;
          syncStateRef.current.currentTime = time;
        }
      }
    );
  }, []);
  return audioRef.current;
}