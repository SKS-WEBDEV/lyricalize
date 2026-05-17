import React, { useMemo, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
export function Canvas() {
  const lyrics = useEditorStore((s) => s.lyrics);
  const currentTime = useEditorStore((s) => s.currentTime);
  const lyricOffset = useEditorStore((s) => s.lyricOffset);
  const isBuffering = useEditorStore((s) => s.isBuffering);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const hasTrack = useEditorStore((s) => !!s.track);
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
  // Window of visibility: Symmetric layout (3 before, active, 3 after)
  const visibleLyrics = useMemo(() => {
    if (lyrics.length === 0) return [];
    if (activeIndex === -1) {
      return lyrics.slice(0, 7).map((l, i) => ({ ...l, originalIndex: i }));
    }
    const start = Math.max(0, activeIndex - 3);
    const end = Math.min(lyrics.length, activeIndex + 4);
    return lyrics.slice(start, end).map((l, i) => ({
      ...l,
      originalIndex: start + i
    }));
  }, [lyrics, activeIndex]);
  return (
    <div className="flex-1 bg-black flex flex-col items-center justify-center overflow-hidden relative">
      <motion.div
        animate={{ opacity: isPlaying ? 0.08 : 0.03 }}
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:80px_80px]"
      />
      <div className="w-full max-w-5xl px-6 md:px-16 z-10">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <AnimatePresence mode="popLayout">
            {activeIndex !== -1 || (hasTrack && lyrics.length > 0) ? (
              <motion.div
                layout
                className="flex flex-col items-center gap-8 md:gap-10 w-full"
              >
                {visibleLyrics.map((line) => {
                  const isActive = line.originalIndex === activeIndex;
                  const distance = Math.abs(line.originalIndex - activeIndex);
                  // Refined smooth gradient for distal lyrics
                  let opacity = 0.3;
                  if (isActive) opacity = 1;
                  else if (distance === 1) opacity = 0.45;
                  else if (distance === 2) opacity = 0.2;
                  else opacity = 0.1;
                  return (
                    <motion.div
                      key={`${line.time}-${line.originalIndex}`}
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{
                        opacity,
                        scale: isActive ? 1 : 0.92,
                        y: 0,
                        filter: isActive ? 'blur(0px)' : `blur(${distance * 1}px)`,
                      }}
                      exit={{ opacity: 0, scale: 0.85, y: -20 }}
                      transition={{
                        type: 'spring',
                        stiffness: 160, // Snappier
                        damping: 24,
                        mass: 0.6
                      }}
                      style={{
                        fontFamily,
                        fontSize: isActive ? `${fontSize}px` : `${Math.max(20, fontSize * 0.75)}px`,
                        fontWeight: isActive ? fontWeight : '400',
                        color: isActive ? color : '#ffffff',
                        lineHeight: isActive ? lineHeight : 1.4,
                        textAlign,
                        textTransform,
                        textShadow: (isActive && glowIntensity > 0)
                          ? `0 0 ${glowIntensity}px ${glowColor}, ${textShadow}`
                          : 'none',
                      }}
                      className={cn(
                        "select-none tracking-tight transition-colors duration-500 cursor-default px-4",
                        isActive ? "drop-shadow-2xl" : "opacity-40"
                      )}
                    >
                      {line.text}
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                className="text-white/40 text-sm md:text-base tracking-[0.6em] uppercase font-light text-center px-8 flex flex-col items-center gap-4"
              >
                <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/40 to-transparent" />
                {!hasTrack ? 'Discovery Mode' : 'Awaiting Connection'}
                <div className="w-px h-12 bg-gradient-to-t from-transparent via-white/40 to-transparent" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {isBuffering && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-12 right-12 flex items-center gap-3 text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] bg-white/5 backdrop-blur-2xl px-6 py-3 rounded-2xl border border-white/10 shadow-2xl"
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
          Syncing High Fidelity
        </motion.div>
      )}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black to-transparent pointer-events-none z-20" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent pointer-events-none z-20" />
    </div>
  );
}