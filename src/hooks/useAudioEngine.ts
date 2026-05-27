import { useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { toast } from 'sonner';
import { safeError } from '@/lib/utils';

// Shared log prefix for easy filtering in DevTools: filter by "[AudioEngine]"
const TAG = '[AudioEngine]';

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
    console.log(`${TAG} 🔧 Initializing audio engine...`);

    const audio = new Audio();
    audio.id = 'lyricalize-audio-player';
    
    // Add the audio element to the DOM for proper browser support
    // Some browsers require the audio element to be in the DOM for playback
    if (!document.getElementById('lyricalize-audio-player')) {
      document.body.appendChild(audio);
      console.log(`${TAG} 📍 Audio element added to DOM`);
    }

    // --- Native browser audio event logging ---
    // These fire in order during a normal load: loadstart → loadeddata → canplay → playing
    const nativeEventLog: Record<string, { emoji: string; detail: () => string }> = {
      loadstart:      { emoji: '📡', detail: () => `Fetching audio from: ${audio.src}` },
      loadeddata:     { emoji: '📦', detail: () => `First data frame loaded. readyState=${audio.readyState}` },
      canplay:        { emoji: '✅', detail: () => `Can start playing. duration=${audio.duration}s` },
      canplaythrough: { emoji: '🟢', detail: () => `Can play through without buffering. duration=${audio.duration}s` },
      play:           { emoji: '▶️',  detail: () => `Play requested. currentTime=${audio.currentTime}s` },
      playing:        { emoji: '🎶', detail: () => `Audio is now playing. currentTime=${audio.currentTime}s` },
      pause:          { emoji: '⏸️',  detail: () => `Paused at ${audio.currentTime}s` },
      ended:          { emoji: '🏁', detail: () => `Playback ended.` },
      waiting:        { emoji: '⏳', detail: () => `Buffering... waiting for data at ${audio.currentTime}s` },
      stalled:        { emoji: '🚧', detail: () => `Stalled — browser cannot fetch data. src=${audio.src}` },
      suspend:        { emoji: '💤', detail: () => `Browser suspended loading. readyState=${audio.readyState}` },
      abort:          { emoji: '🛑', detail: () => `Loading aborted.` },
      emptied:        { emoji: '🗑️',  detail: () => `Audio element emptied (src changed or load() called).` },
      durationchange: { emoji: '⏱️',  detail: () => `Duration changed to ${audio.duration}s` },
      timeupdate:     { emoji: '🕐', detail: () => `Time updated: ${audio.currentTime}s` },
      volumechange:   { emoji: '🔊', detail: () => `Volume=${audio.volume}, muted=${audio.muted}` },
      error:          { emoji: '❌', detail: () => `Error code=${audio.error?.code}, message=${audio.error?.message}` },
      seeked:         { emoji: '⏭️',  detail: () => `Seeked to ${audio.currentTime}s` },
      seeking:        { emoji: '🔍', detail: () => `Seeking to a new position...` },
    };

    Object.entries(nativeEventLog).forEach(([event, { emoji, detail }]) => {
      audio.addEventListener(event, () => {
        console.log(`${TAG} ${emoji} [${event}] ${detail()}`);
      });
    });

    audio.crossOrigin = "anonymous";
    audioRef.current = audio;
    console.log(`${TAG} 🔧 Audio element created. crossOrigin=anonymous`);

    // --- Store-syncing event handlers ---

    const onPlay = () => {
      console.log(`${TAG} ▶️ [onPlay] Syncing isPlaying=true to store.`);
      syncStateRef.current.isPlaying = true;
      useEditorStore.getState().setIsPlaying(true);
    };

    const onPause = () => {
      console.log(`${TAG} ⏸️ [onPause] Syncing isPlaying=false to store.`);
      syncStateRef.current.isPlaying = false;
      useEditorStore.getState().setIsPlaying(false);
    };

    const onEnded = () => {
      console.log(`${TAG} 🏁 [onEnded] Track finished. Resetting currentTime to 0.`);
      syncStateRef.current.isPlaying = false;
      useEditorStore.getState().setIsPlaying(false);
      useEditorStore.getState().setCurrentTime(0);
    };

    const onLoadedMetadata = () => {
      const d = audio.duration;
      console.log(`${TAG} 📋 [onLoadedMetadata] Metadata ready. duration=${d}s, readyState=${audio.readyState}`);
      syncStateRef.current.duration = d;
      useEditorStore.getState().setDuration(d);
      useEditorStore.getState().setIsBuffering(false);
    };

    const onDurationChange = () => {
      const d = audio.duration;
      if (isFinite(d) && d > 0) {
        console.log(`${TAG} ⏱️ [onDurationChange] Duration settled to ${d}s — updating store.`);
        syncStateRef.current.duration = d;
        useEditorStore.getState().setDuration(d);
      } else {
        console.log(`${TAG} ⏱️ [onDurationChange] Duration is not yet finite (${d}) — skipping store update.`);
      }
    };

    const onWaiting = () => {
      console.log(`${TAG} ⏳ [onWaiting] Audio is buffering — setting isBuffering=true in store.`);
      useEditorStore.getState().setIsBuffering(true);
    };

    const onPlaying = () => {
      console.log(`${TAG} 🎶 [onPlaying] Resumed from buffer — setting isBuffering=false in store.`);
      useEditorStore.getState().setIsBuffering(false);
    };

    const onError = () => {
      const currentSrc = audio.getAttribute('src');
      if (!currentSrc || currentSrc === "" || currentSrc === window.location.href) {
        console.log(`${TAG} ⚠️ [onError] Suppressed — no valid src set yet.`);
        return;
      }
      const error = audio.error;
      let message = 'Audio playback error';
      if (error?.code === 4 || error?.code === 3) {
        message = 'Track unavailable or format not supported';
      } else if (error?.code === 2) {
        message = 'Network error during playback';
      }
      console.group(`${TAG} ❌ [onError] Playback error`);
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message || 'Media Error');
      console.error('Failed src:', currentSrc);
      console.error('readyState at error:', audio.readyState);
      console.groupEnd();
      console.warn(`${TAG} Audio Engine Notice:`, safeError({
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
    console.log(`${TAG} 🔄 RAF sync loop started.`);

    return () => {
      console.log(`${TAG} 🧹 Cleaning up audio engine — pausing, clearing src, removing from DOM, cancelling RAF.`);
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      
      // Remove event listeners
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('error', onError);
      
      // Remove from DOM if it's still there
      if (audio.parentNode) {
        audio.parentNode.removeChild(audio);
        console.log(`${TAG} 📍 Audio element removed from DOM`);
      }
      
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

        console.group(`${TAG} 🎵 Track Change`);
        console.log('Track object:', track);
        console.log('downloadUrl array:', track?.downloadUrl);

        if (!track) {
          console.log(`${TAG} ⚠️ Track is null/undefined. Clearing audio source.`);
          audio.pause();
          audio.removeAttribute('src');
          useEditorStore.getState().setIsPlaying(false);
          useEditorStore.getState().setIsBuffering(false);
          useEditorStore.getState().setDuration(0);
          syncStateRef.current.duration = 0;
          console.groupEnd();
          return;
        }

        // Validate downloadUrl array exists and has entries
        const downloadUrls = track?.downloadUrl;
        if (!Array.isArray(downloadUrls) || downloadUrls.length === 0) {
          console.warn(`${TAG} ⚠️ No valid downloadUrl entries found for track:`, {
            trackId: track.id,
            trackName: track.title,
            downloadUrlType: typeof downloadUrls,
            downloadUrlLength: downloadUrls?.length
          });
          console.groupEnd();
          return;
        }

        // track.url from the API is a JioSaavn page link, NOT a streamable audio URL.
        // Audio URLs must always be sourced exclusively from downloadUrl[].url.
        // Priority: highest quality (last) → 320kbps → 160kbps → lowest quality fallback
        const bestQuality = downloadUrls[downloadUrls.length - 1]; // Highest quality (last)
        const index320 = downloadUrls.find((d) => d.quality === '320kbps');
        const index160 = downloadUrls.find((d) => d.quality === '160kbps');
        const fallback = downloadUrls[0]; // Lowest quality

        console.log('Best quality entry (last):', bestQuality);
        console.log('320kbps entry:', index320);
        console.log('160kbps entry:', index160);
        console.log('Fallback entry:', fallback);

        const url = bestQuality?.url || index320?.url || index160?.url || fallback?.url || '';
        const selectedQuality = bestQuality?.quality ?? index320?.quality ?? index160?.quality ?? fallback?.quality ?? 'unknown';
        
        console.log(`Resolved audio URL: "${url}" (quality: ${selectedQuality})`);

        if (url) {
          console.log(`${TAG} 📥 Setting audio src and calling load()...`);
          useEditorStore.getState().setIsBuffering(true);
          useEditorStore.getState().setDuration(0);
          syncStateRef.current.duration = 0;

          audio.pause();
          audio.src = url;
          audio.load();

          console.log(`${TAG} 🔗 audio.src confirmed:`, audio.src);
          console.log(`${TAG} 📶 readyState after load():`, audio.readyState, '(0=HAVE_NOTHING, 1=HAVE_METADATA, 2=HAVE_CURRENT_DATA, 3=HAVE_FUTURE_DATA, 4=HAVE_ENOUGH_DATA)');

          if (useEditorStore.getState().isPlaying) {
            console.log(`${TAG} ▶️ isPlaying=true in store — attempting auto play...`);
            audio.play().then(() => {
              console.log(`${TAG} ✅ Auto playback started successfully.`);
            }).catch((err) => {
              console.error(`${TAG} ❌ Auto playback failed:`, err);
            });
          } else {
            console.log(`${TAG} ⏸️ isPlaying=false — audio loaded but not auto-playing.`);
          }
        } else {
          console.warn(`${TAG} ⚠️ No valid audio URL found in downloadUrl. Clearing audio src.`);
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
        if (!audio || !audio.src) {
          console.log(`${TAG} ⏭️ [Playback Sub] Skipped — no audio src set.`);
          return;
        }
        console.log(`${TAG} 🎛️ [Playback Sub] isPlaying changed to: ${playing}. audio.paused=${audio.paused}`);
        if (playing && audio.paused) {
          console.log(`${TAG} ▶️ [Playback Sub] Calling audio.play()...`);
          audio.play().then(() => {
            console.log(`${TAG} ✅ [Playback Sub] Playback started.`);
          }).catch((err) => {
            console.error(`${TAG} ❌ [Playback Sub] play() rejected:`, err);
            useEditorStore.getState().setIsPlaying(false);
          });
        } else if (!playing && !audio.paused) {
          console.log(`${TAG} ⏸️ [Playback Sub] Calling audio.pause().`);
          audio.pause();
        } else {
          console.log(`${TAG} ℹ️ [Playback Sub] No action needed (already in desired state).`);
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
          console.log(`${TAG} 🔊 [Volume Sub] volume=${volume}, muted=${isMuted}`);
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
        const drift = Math.abs(audio.currentTime - time);
        // Only seek if the drift is large (user interaction/seek)
        // This prevents the sync loop from fighting with the manual seek
        if (drift > 1.2) {
          console.log(`${TAG} ⏭️ [Seek Sub] Large drift detected (${drift.toFixed(2)}s) — seeking to ${time}s`);
          audio.currentTime = time;
          syncStateRef.current.currentTime = time;
        }
      }
    );
  }, []);

  return audioRef.current;
}
