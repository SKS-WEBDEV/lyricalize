import { useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { toast } from 'sonner';
import { safeError } from '@/lib/utils';
export function useAudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const frameRef = useRef<number>(0);
  const syncStateRef = useRef({ currentTime: 0, isPlaying: false });
  // Strictly primitive selectors to avoid getSnapshot issues
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const volume = useEditorStore((s) => s.volume);
  const isMuted = useEditorStore((s) => s.isMuted);
  const trackUrl = useEditorStore((s) => s.track?.url);
  const trackId = useEditorStore((s) => s.track?.id);
  const currentTime = useEditorStore((s) => s.currentTime);
  const setIsPlaying = useEditorStore((s) => s.setIsPlaying);
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime);
  const setDuration = useEditorStore((s) => s.setDuration);
  const setIsBuffering = useEditorStore((s) => s.setIsBuffering);
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
  }, [setCurrentTime, setDuration, setIsBuffering, setIsPlaying]);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (trackUrl) {
      setIsBuffering(true);
      audio.src = trackUrl;
      audio.load();
    } else {
      audio.pause();
      audio.removeAttribute('src');
      setIsPlaying(false);
      setIsBuffering(false);
    }
  }, [trackUrl, trackId, setIsBuffering, setIsPlaying]);
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);
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
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && audio.getAttribute('src') && Math.abs(audio.currentTime - currentTime) > 1.2) {
      audio.currentTime = currentTime;
    }
  }, [currentTime]);
  useEffect(() => {
    const update = () => {
      const audio = audioRef.current;
      if (audio && syncStateRef.current.isPlaying && audio.getAttribute('src')) {
        const audioTime = audio.currentTime;
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