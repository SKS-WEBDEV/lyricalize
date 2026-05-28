import { useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { toast } from 'sonner';
import { safeError } from '@/lib/utils';
import { logger } from '@/utils/logger';

// Shared log prefix for easy filtering in DevTools: filter by "[AudioEngine]"
const TAG = '[AudioEngine]';

export function useAudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const frameRef = useRef<number>(0);
  const objectUrlRef = useRef<string | null>(null);
  const loadSequenceRef = useRef(0);
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

  const fetchAndLoadAudio = async (remoteUrl: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    const sequence = ++loadSequenceRef.current;
    logger.info(TAG, `🎧 [fetchAndLoadAudio] Fetching remote audio: ${remoteUrl}`);
    useEditorStore.getState().setIsBuffering(true);

    try {
      const response = await fetch(remoteUrl, { mode: 'cors' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      if (loadSequenceRef.current !== sequence) {
        logger.warn(TAG, '⚠️ [fetchAndLoadAudio] Stale load, discarding object URL.');
        URL.revokeObjectURL(objectUrl);
        return;
      }

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      objectUrlRef.current = objectUrl;

      audio.pause();
      audio.src = objectUrl;
      audio.load();

      logger.info(TAG, '✅ [fetchAndLoadAudio] Audio loaded into player', {
        objectUrl,
        blobType: blob.type,
        blobSize: blob.size
      });

      if (useEditorStore.getState().isPlaying) {
        logger.debug(TAG, '▶️ [fetchAndLoadAudio] isPlaying=true => attempt play');
        audio.play().then(() => {
          logger.info(TAG, '✅ [fetchAndLoadAudio] Playback started after fetch.');
        }).catch((err) => {
          logger.error(TAG, '❌ [fetchAndLoadAudio] Playback rejected:', err);
          useEditorStore.getState().setIsPlaying(false);
        });
      }
    } catch (error) {
      logger.error(TAG, '❌ [fetchAndLoadAudio] Fetch failed:', error);
      toast.error('Failed to load audio track.');
      useEditorStore.getState().setIsPlaying(false);
      useEditorStore.getState().setIsBuffering(false);
      useEditorStore.getState().setCurrentAudioUrl(null);
    }
  };

  // Initialization: Setup audio element and event listeners
  useEffect(() => {
    logger.debug(TAG, '🔧 Initializing audio engine...');

    const audio = new Audio();
    audio.id = 'lyricalize-audio-player';
    
    // Add the audio element to the DOM for proper browser support
    // Some browsers require the audio element to be in the DOM for playback
    if (!document.getElementById('lyricalize-audio-player')) {
      document.body.appendChild(audio);
      logger.debug(TAG, '📍 Audio element added to DOM');
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
      error:          { emoji: '❌', detail: () => `Error code=${audio.error?.code}, message=${audio.error?.message}` },
      seeked:         { emoji: '⏭️',  detail: () => `Seeked to ${audio.currentTime}s` },
      seeking:        { emoji: '🔍', detail: () => `Seeking to a new position...` },
    };

    Object.entries(nativeEventLog).forEach(([event, { emoji, detail }]) => {
      audio.addEventListener(event, () => {
        logger.debug(TAG, `${emoji} [${event}] ${detail()}`);
      });
    });

    audio.crossOrigin = "anonymous";
    audioRef.current = audio;
    logger.debug(TAG, '🔧 Audio element created. crossOrigin=anonymous');

    // --- Store-syncing event handlers ---

    const onPlay = () => {
      logger.debug(TAG, '▶️ [onPlay] Syncing isPlaying=true to store.');
      syncStateRef.current.isPlaying = true;
      useEditorStore.getState().setIsPlaying(true);
    };

    const onPause = () => {
      logger.debug(TAG, '⏸️ [onPause] Syncing isPlaying=false to store.');
      syncStateRef.current.isPlaying = false;
      useEditorStore.getState().setIsPlaying(false);
    };

    const onEnded = () => {
      logger.info(TAG, '🏁 [onEnded] Track finished.');
      useEditorStore.getState().setIsPlaying(false);
      useEditorStore.getState().setCurrentTime(0);
    };

    const onLoadedMetadata = () => {
      const d = audio.duration;
      logger.debug(TAG, `📋 [onLoadedMetadata] Metadata ready. duration=${d}s, readyState=${audio.readyState}`);
      syncStateRef.current.duration = d;
      useEditorStore.getState().setDuration(d);
      useEditorStore.getState().setIsBuffering(false);
    };

    const onDurationChange = () => {
      const d = audio.duration;
      if (isFinite(d) && d > 0) {
        logger.debug(TAG, `⏱️ [onDurationChange] Duration settled to ${d}s — updating store.`);
        syncStateRef.current.duration = d;
        useEditorStore.getState().setDuration(d);
      } else {
        logger.debug(TAG, `⏱️ [onDurationChange] Duration is not yet finite (${d}) — skipping store update.`);
      }
    };

    const onWaiting = () => {
      logger.debug(TAG, '⏳ [onWaiting] Audio is buffering — setting isBuffering=true in store.');
      useEditorStore.getState().setIsBuffering(true);
    };

    const onPlaying = () => {
      logger.debug(TAG, '🎶 [onPlaying] Resumed from buffer — setting isBuffering=false in store.');
      useEditorStore.getState().setIsBuffering(false);
    };

    const onError = () => {
      const currentSrc = audio.getAttribute('src');
      if (!currentSrc || currentSrc === "" || currentSrc === window.location.href) {
        logger.debug(TAG, '⚠️ [onError] Suppressed — no valid src set yet.');
        return;
      }
      const error = audio.error;
      let message = 'Audio playback error';
      if (error?.code === 4 || error?.code === 3) {
        message = 'Track unavailable or format not supported';
      } else if (error?.code === 2) {
        message = 'Network error during playback';
      }
      logger.group(`${TAG} ❌ [onError] Playback error`, () => {
        logger.error(TAG, 'Error code:', error?.code);
        logger.error(TAG, 'Error message:', error?.message || 'Media Error');
        logger.error(TAG, 'Failed src:', currentSrc);
        logger.error(TAG, 'readyState at error:', audio.readyState);
      });
      logger.warn(TAG, 'Audio Engine Notice:', safeError({
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
    logger.debug(TAG, '🔄 RAF sync loop started.');

    return () => {
      logger.debug(TAG, '🧹 Cleaning up audio engine — pausing, clearing src, removing from DOM, cancelling RAF.');
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
        logger.debug(TAG, '📍 Audio element removed from DOM');
      }

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
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

        logger.group(`${TAG} 🎵 Track Change`, () => {
          logger.debug(TAG, 'Track object:', track);
          logger.debug(TAG, 'downloadUrl array:', track?.downloadUrl);

          if (!track) {
            logger.debug(TAG, '⚠️ Track is null/undefined. Clearing audio source.');
            audio.pause();
            audio.removeAttribute('src');
            audio.load();
            if (objectUrlRef.current) {
              URL.revokeObjectURL(objectUrlRef.current);
              objectUrlRef.current = null;
            }
            useEditorStore.getState().setCurrentAudioUrl(null);
            useEditorStore.getState().setIsPlaying(false);
            useEditorStore.getState().setIsBuffering(false);
            useEditorStore.getState().setDuration(0);
            useEditorStore.getState().setCurrentTime(0);
            syncStateRef.current.currentTime = 0;
            syncStateRef.current.duration = 0;
            return;
          }

          // Pause and clear the previous audio source before loading a new track
          audio.pause();
          audio.removeAttribute('src');
          audio.load();
          if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
          }
          useEditorStore.getState().setCurrentAudioUrl(null);
          useEditorStore.getState().setCurrentTime(0);
          syncStateRef.current.currentTime = 0;

          // Validate downloadUrl array exists and has entries
          const downloadUrls = track?.downloadUrl;
          if (!Array.isArray(downloadUrls) || downloadUrls.length === 0) {
            logger.warn(TAG, '⚠️ No valid downloadUrl entries found for track:', {
              trackId: track.id,
              trackName: track.title,
              downloadUrlType: typeof downloadUrls,
              downloadUrlLength: downloadUrls?.length
            });
            console.warn(`%c[AudioEngine] ⚠️ No downloadUrl for track: ${track.title}`, 'color: red; font-weight: bold;');
            return;
          }

          // Log all available download URLs
          console.log(`%c[AudioEngine] Available download URLs for "${track.title}":`, 'color: blue; font-weight: bold;', downloadUrls);

          // track.url from the API is a JioSaavn page link, NOT a streamable audio URL.
          // Audio URLs must always be sourced exclusively from downloadUrl[].url.
          // Priority: highest quality (last) → 320kbps → 160kbps → lowest quality fallback
          const bestQuality = downloadUrls[downloadUrls.length - 1]; // Highest quality (last)
          const index320 = downloadUrls.find((d) => d.quality === '320kbps');
          const index160 = downloadUrls.find((d) => d.quality === '160kbps');
          const fallback = downloadUrls[0]; // Lowest quality

          logger.debug(TAG, 'Best quality entry (last):', bestQuality);
          logger.debug(TAG, '320kbps entry:', index320);
          logger.debug(TAG, '160kbps entry:', index160);
          logger.debug(TAG, 'Fallback entry:', fallback);

          const url = bestQuality?.url || index320?.url || index160?.url || fallback?.url || '';
          const selectedQuality = bestQuality?.quality ?? index320?.quality ?? index160?.quality ?? fallback?.quality ?? 'unknown';
          
          // Always log the selected URL so user can see what's being used
          console.info(`%c[AudioEngine] Selected URL (quality: ${selectedQuality})`, 'color: green; font-weight: bold;', url);
          logger.debug(TAG, `Resolved audio URL: "${url}" (quality: ${selectedQuality})`);

          if (url) {
            logger.debug(TAG, '📥 Fetching and loading audio via fetch()...');
            useEditorStore.getState().setIsBuffering(true);
            useEditorStore.getState().setDuration(0);
            useEditorStore.getState().setCurrentAudioUrl(url);
            syncStateRef.current.duration = 0;

            void fetchAndLoadAudio(url);
          } else {
            logger.warn(TAG, '⚠️ No valid audio URL found in downloadUrl. Clearing audio src.');
            console.warn(`%c[AudioEngine] ⚠️ No valid URL could be resolved for track: ${track.title}`, 'color: red; font-weight: bold;');
            audio.pause();
            audio.removeAttribute('src');
            useEditorStore.getState().setCurrentAudioUrl(null);
            useEditorStore.getState().setIsPlaying(false);
            useEditorStore.getState().setIsBuffering(false);
            useEditorStore.getState().setDuration(0);
            syncStateRef.current.duration = 0;
          }
        });
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
          return;
        }
        if (playing && audio.paused) {
          audio.play().catch((err) => {
            logger.error(TAG, '❌ [Playback Sub] play() rejected:', err);
            useEditorStore.getState().setIsPlaying(false);
          });
        } else if (!playing && !audio.paused) {
          audio.pause();
        }
      }
    );
  }, []);

  // Volume & Mute Subscriptions
  useEffect(() => {
    const unsubscribeVolume = (useEditorStore.subscribe as any)(
      (state) => state.volume,
      (volume) => {
        if (audioRef.current) {
          audioRef.current.volume = volume;
        }
      }
    );

    const unsubscribeMute = (useEditorStore.subscribe as any)(
      (state) => state.isMuted,
      (isMuted) => {
        if (audioRef.current) {
          audioRef.current.muted = isMuted;
        }
      }
    );

    return () => {
      unsubscribeVolume();
      unsubscribeMute();
    };
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
          logger.debug(TAG, `⏭️ [Seek Sub] Large drift detected (${drift.toFixed(2)}s) — seeking to ${time}s`);
          audio.currentTime = time;
          syncStateRef.current.currentTime = time;
        }
      }
    );
  }, []);

  return audioRef.current;
}
