import { useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { toast } from 'sonner';
import { safeError } from '@/lib/utils';
import { logger } from '@/utils/logger';

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
    const debugEvents = [
      "loadstart",
      "loadeddata",
      "canplay",
      "play",
      "pause",
      "ended",
      "error"
    ];

    debugEvents.forEach(event => {
      audio.addEventListener(event, () => {
        console.log(`🎧 [${event}]`, {
          src: audio.src,
          time: audio.currentTime,
          readyState: audio.readyState
        });
      });
    });

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
    const onDurationChange = () => {
      const d = audio.duration;
      if (isFinite(d) && d > 0) {
        syncStateRef.current.duration = d;
        useEditorStore.getState().setDuration(d);
      }
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
    audio.addEventListener('durationchange', onDurationChange);
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
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('error', onError);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  // Track & Source Subscription
  useEffect(() => {
    return (useEditorStore.subscribe as any)(
      (state) => state.track,
      (track) => {
        const audio = audioRef.current;
        if (!audio) return;

        console.group("🎵 Track Change");
        console.log("Track object:", track);

        // FIX: track.url from the API is a JioSaavn page link, NOT a streamable audio URL.
        // Audio URLs must always be sourced exclusively from downloadUrl[].url.
        // Priority: highest quality (last) → explicit 320kbps index → lowest quality fallback.
        const url =
          track?.downloadUrl?.at(-1)?.url ||  // Best quality (e.g. 320kbps)
          track?.downloadUrl?.[4]?.url ||      // Explicit 320kbps fallback
          track?.downloadUrl?.[0]?.url ||      // Last resort: lowest quality
          '';

        console.log("Resolved audio URL:", url);

        if (url) {
          useEditorStore.getState().setIsBuffering(true);
          useEditorStore.getState().setDuration(0);
          syncStateRef.current.duration = 0;

          audio.pause();
          audio.src = url;
          audio.load();

          console.log("Audio src set to:", audio.src);

          if (useEditorStore.getState().isPlaying) {
            audio.play().then(() => {
              console.log("✅ Auto playback success");
            }).catch((err) => {
              console.error("❌ Auto playback failed:", err);
            });
          }
        } else {
          console.warn("⚠️ No valid audio URL found in downloadUrl");

          audio.pause();
          audio.removeAttribute('src');

          useEditorStore.getState().setIsPlaying(false);
          useEditorStore.getState().setIsBuffering(false);
          useEditorStore.getState().setDuration(0);

          syncStateRef.current.duration = 0;
        }

        console.groupEnd();
      }
    );
  }, []);

  // Playback Control Subscription
  useEffect(() => {
    return (useEditorStore.subscribe as any)(
      (state) => state.isPlaying,
      (playing) => {
        const audio = audioRef.current;
        if (!audio || !audio.src) return;
        if (playing && audio.paused) {
          audio.play().then(() => {
            console.log("▶️ Playback started");
          }).catch((err) => {
            console.error("❌ Play request failed:", err);
            useEditorStore.getState().setIsPlaying(false);
          });
        } else if (!playing && !audio.paused) {
          audio.pause();
        }
      }
    );
  }, []);

  // Volume & Mute Subscription
  useEffect(() => {
    return (useEditorStore.subscribe as any)(
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
    return (useEditorStore.subscribe as any)(
      (state) => state.currentTime,
      (time) => {
        const audio = audioRef.current;
        if (!audio || !audio.src) return;
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
