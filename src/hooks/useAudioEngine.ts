import { useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
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
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onError = (e: any) => {
      console.error('Audio Error:', e);
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
    if (audioRef.current && track?.url) {
      const wasPlaying = isPlaying;
      audioRef.current.src = track.url;
      audioRef.current.load();
      if (wasPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [track?.url, setIsPlaying]);
  // Sync Volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);
  // Sync Playback State
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => setIsPlaying(false));
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, setIsPlaying]);
  // Sync Seek (When store currentTime changes externally)
  useEffect(() => {
    if (audioRef.current && Math.abs(audioRef.current.currentTime - currentTime) > 0.5) {
      audioRef.current.currentTime = currentTime;
    }
  }, [currentTime]);
  // High-precision Time Update Loop
  useEffect(() => {
    let isActive = true;
    const update = () => {
      if (audioRef.current && isPlaying && isActive) {
        setCurrentTime(audioRef.current.currentTime);
      }
      frameRef.current = requestAnimationFrame(update);
    };
    frameRef.current = requestAnimationFrame(update);
    return () => {
      isActive = false;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isPlaying, setCurrentTime]);
  return audioRef.current;
}