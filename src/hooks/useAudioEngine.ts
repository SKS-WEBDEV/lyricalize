import { useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { toast } from 'sonner';
import { safeError } from '@/lib/utils';
export function useAudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const frameRef = useRef<number>(0);
  // Zustand Zero-Tolerance Rule: Primitive selectors only
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const volume = useEditorStore((s) => s.volume);
  const trackUrl = useEditorStore((s) => s.track?.url);
  const trackId = useEditorStore((s) => s.track?.id);
  const currentTime = useEditorStore((s) => s.currentTime);
  const setIsPlaying = useEditorStore((s) => s.setIsPlaying);
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime);
  const setDuration = useEditorStore((s) => s.setDuration);
  const setIsBuffering = useEditorStore((s) => s.setIsBuffering);
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
      const error = audio.error;
      let message = 'Audio playback error';
      if (error?.code === 4 || error?.code === 3) {
        message = 'Track unavailable or format not supported';
      } else if (error?.code === 2) {
        message = 'Network error during playback';
      }
      // Use safeError to avoid empty object logging for MediaError
      console.error('Audio Engine Error:', safeError({ 
        code: error?.code, 
        message: error?.message || 'Unknown MediaError' 
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
  // Sync Source - Refactored to avoid cycles and handle restarts properly
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (trackUrl) {
      // Capture if it was playing before the change
      const shouldResume = isPlaying || !audio.paused;
      setIsBuffering(true);
      audio.pause();
      audio.src = trackUrl;
      audio.load();
      if (shouldResume) {
        audio.play().catch((err) => {
          console.warn('Auto-play failed after source change:', safeError(err));
          setIsPlaying(false);
          setIsBuffering(false);
        });
      }
    } else {
      audio.src = '';
      setIsPlaying(false);
      setIsBuffering(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackUrl, trackId, setIsBuffering, setIsPlaying]);
  // Sync Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);
  // Sync Playback State (Only triggered by store isPlaying changes)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    if (isPlaying && audio.paused) {
      audio.play().catch((err) => {
        console.error('Play request failed:', safeError(err));
        setIsPlaying(false);
      });
    } else if (!isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [isPlaying, setIsPlaying]);
  // Sync Seek (Threshold check to prevent feedback loops)
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && Math.abs(audio.currentTime - currentTime) > 0.8) {
      audio.currentTime = currentTime;
    }
  }, [currentTime]);
  // High-precision Time Update Loop
  useEffect(() => {
    let isActive = true;
    const update = () => {
      if (audioRef.current && isPlaying && isActive) {
        if (Math.abs(audioRef.current.currentTime - currentTime) > 0.1) {
          setCurrentTime(audioRef.current.currentTime);
        }
      }
      frameRef.current = requestAnimationFrame(update);
    };
    frameRef.current = requestAnimationFrame(update);
    return () => {
      isActive = false;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isPlaying, setCurrentTime, currentTime]);
  return audioRef.current;
}