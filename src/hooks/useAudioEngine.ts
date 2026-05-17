import { useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { toast } from 'sonner';
export function useAudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const frameRef = useRef<number>(0);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const volume = useEditorStore((s) => s.volume);
  const track = useEditorStore((s) => s.track);
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
    const onError = (e: any) => {
      const error = audio.error;
      let message = 'Audio playback error';
      if (error?.code === 4 || error?.code === 3) {
        message = 'Track unavailable or format not supported';
      } else if (error?.code === 2) {
        message = 'Network error during playback';
      }
      console.error('Audio Engine Error:', error);
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
  // Sync Source
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && track?.url) {
      const wasPlaying = isPlaying;
      setIsBuffering(true);
      // Stop current before switching
      audio.pause();
      audio.src = track.url;
      audio.load();
      if (wasPlaying) {
        audio.play().catch((err) => {
          console.warn('Auto-play failed after source change:', err);
          setIsPlaying(false);
          setIsBuffering(false);
        });
      }
    } else if (audio && !track) {
      audio.src = '';
      setIsPlaying(false);
      setIsBuffering(false);
    }
  }, [track?.url, setIsPlaying, setIsBuffering]); // Note: isPlaying intentionally omitted to avoid loops on manual play/pause
  // Sync Volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);
  // Sync Playback State (Only triggered by store isPlaying changes)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    if (isPlaying) {
      if (audio.paused) {
        audio.play().catch((err) => {
          console.error('Play request failed:', err);
          setIsPlaying(false);
        });
      }
    } else {
      if (!audio.paused) {
        audio.pause();
      }
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
        // Use a small threshold to avoid excessive state updates if they are identical
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