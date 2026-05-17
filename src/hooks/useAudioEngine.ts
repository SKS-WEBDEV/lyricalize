import { useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { toast } from 'sonner';
import { safeError } from '@/lib/utils';
export function useAudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const frameRef = useRef<number>(0);
  // Ref to track latest values for the RAF loop without re-triggering effects
  const syncStateRef = useRef({ currentTime: 0, isPlaying: false });
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const volume = useEditorStore((s) => s.volume);
  const trackUrl = useEditorStore((s) => s.track?.url);
  const trackId = useEditorStore((s) => s.track?.id);
  const currentTime = useEditorStore((s) => s.currentTime);
  const setIsPlaying = useEditorStore((s) => s.setIsPlaying);
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime);
  const setDuration = useEditorStore((s) => s.setDuration);
  const setIsBuffering = useEditorStore((s) => s.setIsBuffering);
  // Update refs on every change to keep sync loop fresh without dependency thrashing
  useEffect(() => {
    syncStateRef.current = { currentTime, isPlaying };
  }, [currentTime, isPlaying]);
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsBuffering(false);
    };
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onError = () => {
      // Enhanced check for empty src to suppress false errors on cleanup or reset
      const currentSrc = audio.getAttribute('src');
      if (!currentSrc || currentSrc === "" || currentSrc === window.location.href) {
        return; 
      }
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
      setIsPlaying(false);
      setIsBuffering(false);
    };
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('error', onError);
    return () => {
      audio.pause();
      audio.removeAttribute('src'); // Use removeAttribute instead of empty string
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
  }, [setCurrentTime, setDuration, setIsBuffering, setIsPlaying]);
  // Sync Source
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (trackUrl) {
      setIsBuffering(true);
      audio.pause();
      audio.src = trackUrl;
      audio.load();
      // Logic for auto-resume if it was already playing is handled by 'Sync Playback State' effect
    } else {
      audio.pause();
      audio.removeAttribute('src');
      setIsPlaying(false);
      setIsBuffering(false);
    }
  }, [trackUrl, trackId, setIsBuffering, setIsPlaying]);
  // Sync Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);
  // Sync Playback State (Handles all Play/Pause logic centrally)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audio.getAttribute('src')) return;
    if (isPlaying && audio.paused) {
      audio.play().catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Play request failed:', safeError(err));
          setIsPlaying(false);
        }
      });
    } else if (!isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [isPlaying, setIsPlaying, trackUrl]);
  // Sync Seek (Threshold check)
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && audio.getAttribute('src') && Math.abs(audio.currentTime - currentTime) > 1.2) {
      audio.currentTime = currentTime;
    }
  }, [currentTime]);
  // High-precision sync loop (Optimized to avoid re-creating on every tick)
  useEffect(() => {
    const update = () => {
      const audio = audioRef.current;
      if (audio && syncStateRef.current.isPlaying && audio.getAttribute('src')) {
        const audioTime = audio.currentTime;
        // Throttled store update: only update if drift is significant (>100ms)
        if (Math.abs(audioTime - syncStateRef.current.currentTime) > 0.1) {
          setCurrentTime(audioTime);
        }
      }
      frameRef.current = requestAnimationFrame(update);
    };
    frameRef.current = requestAnimationFrame(update);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [setCurrentTime]);
  return audioRef.current;
}