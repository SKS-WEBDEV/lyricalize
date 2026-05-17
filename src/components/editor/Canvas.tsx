import React, { useMemo, useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { Loader2 } from 'lucide-react';
export function Canvas() {
  const lyrics = useEditorStore((s) => s.lyrics);
  const currentTime = useEditorStore((s) => s.currentTime);
  const lyricOffset = useEditorStore((s) => s.lyricOffset);
  const isBuffering = useEditorStore((s) => s.isBuffering);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const hasTrack = useEditorStore((s) => !!s.track);
  // Styling Primitives
  const fontFamily = useEditorStore((s) => s.style.fontFamily);
  const fontSize = useEditorStore((s) => s.style.fontSize);
  const color = useEditorStore((s) => s.style.color);
  const fontWeight = useEditorStore((s) => s.style.fontWeight);
  const lineHeight = useEditorStore((s) => s.style.lineHeight);
  const textAlign = useEditorStore((s) => s.style.textAlign);
  const textTransform = useEditorStore((s) => s.style.textTransform);
  const glowColor = useEditorStore((s) => s.style.glowColor);
  const glowIntensity = useEditorStore((s) => s.style.glowIntensity);
  const textShadow = useEditorStore((s) => s.style.textShadow);
  const animationType = useEditorStore((s) => s.style.animationType);
  const activeIndex = useMemo(() => {
    if (!lyrics || lyrics.length === 0) return -1;
    let index = -1;
    const adjustedTime = currentTime - (lyricOffset / 1000);
    for (let i = 0; i < lyrics.length; i++) {
      if (lyrics[i].time <= adjustedTime) {
        index = i;
      } else {
        break;
      }
    }
    return index;
  }, [lyrics, currentTime, lyricOffset]);
  useEffect(() => {
    if (fontFamily) {
      const fontName = fontFamily.replace(/\s+/g, '+');
      const linkId = 'lyricalise-font-loader';
      let link = document.getElementById(linkId) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;700;900&display=swap`;
    }
  }, [fontFamily]);
  // Spotify-style scroll logic: Show current, 2 previous, 4 next
  const visibleLyrics = useMemo(() => {
    if (activeIndex === -1) return [];
    const start = Math.max(0, activeIndex - 2);
    const end = Math.min(lyrics.length, activeIndex + 6);
    return lyrics.slice(start, end).map((l, i) => ({
      ...l,
      originalIndex: start + i
    }));
  }, [lyrics, activeIndex]);
  return (
    <div className="flex-1 bg-black flex flex-col items-center justify-center overflow-hidden relative">
      <motion.div
        animate={{ opacity: isPlaying ? 0.08 : 0.03 }}
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:60px_60px]"
      />
      <div className="w-full max-w-5xl px-6 md:px-12 z-10 flex flex-col items-center">
        <AnimatePresence mode="popLayout">
          {activeIndex !== -1 ? (
            <div className="flex flex-col items-center gap-8 w-full transition-all duration-700">
              {visibleLyrics.map((line) => {
                const isActive = line.originalIndex === activeIndex;
                const isPast = line.originalIndex < activeIndex;
                return (
                  <motion.div
                    key={`${line.time}-${line.originalIndex}`}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: isActive ? 1 : (isPast ? 0.2 : 0.4),
                      scale: isActive ? 1 : 0.85,
                      y: 0
                    }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    style={{
                      fontFamily: fontFamily,
                      fontSize: isActive ? `${fontSize}px` : `${Math.max(20, fontSize * 0.6)}px`,
                      fontWeight: isActive ? fontWeight : '400',
                      color: isActive ? color : '#ffffff',
                      lineHeight: lineHeight,
                      textAlign: textAlign,
                      textTransform: textTransform,
                      textShadow: (isActive && glowIntensity > 0)
                        ? `${textShadow}, 0 0 ${glowIntensity}px ${glowColor}`
                        : 'none',
                      filter: isActive ? 'blur(0px)' : 'blur(1px)'
                    }}
                    className="select-none tracking-tight transition-all duration-500 cursor-default"
                  >
                    {line.text}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              className="text-white/30 text-xs md:text-sm tracking-[0.5em] uppercase font-light text-center px-4"
            >
              {!hasTrack ? 'Search for a track' : lyrics.length > 0 ? 'Wait for audio sync' : 'Sync lyrics to start'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {isBuffering && (
        <div className="absolute top-4 right-4 md:top-8 md:right-8 flex items-center gap-2 text-white/40 text-[10px] font-mono uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full backdrop-blur-xl border border-white/10">
          <Loader2 className="w-3 h-3 animate-spin" />
          Synchronizing
        </div>
      )}
      <div className="absolute inset-x-0 top-0 h-32 md:h-48 bg-gradient-to-b from-black via-black/60 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-32 md:h-48 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
    </div>
  );
}