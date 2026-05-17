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
  // Window of visibility: Current, 2 before, 4 after
  const visibleLyrics = useMemo(() => {
    if (activeIndex === -1 && lyrics.length > 0) {
      return lyrics.slice(0, 5).map((l, i) => ({ ...l, originalIndex: i }));
    }
    const start = Math.max(0, activeIndex - 2);
    const end = Math.min(lyrics.length, activeIndex + 5);
    return lyrics.slice(start, end).map((l, i) => ({
      ...l,
      originalIndex: start + i
    }));
  }, [lyrics, activeIndex]);
  return (
    <div className="flex-1 bg-black flex flex-col items-center justify-center overflow-hidden relative">
      {/* Subtle Background Pattern */}
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
                className="flex flex-col items-center gap-10 md:gap-12 w-full"
              >
                {visibleLyrics.map((line) => {
                  const isActive = line.originalIndex === activeIndex;
                  const isPast = line.originalIndex < activeIndex;
                  return (
                    <motion.div
                      key={`${line.time}-${line.originalIndex}`}
                      layout
                      initial={{ opacity: 0, y: 30, scale: 0.9, filter: 'blur(10px)' }}
                      animate={{
                        opacity: isActive ? 1 : (isPast ? 0.15 : 0.35),
                        scale: isActive ? 1 : 0.88,
                        y: 0,
                        filter: isActive ? 'blur(0px)' : 'blur(2px)',
                      }}
                      exit={{ opacity: 0, scale: 0.8, y: -20, filter: 'blur(5px)' }}
                      transition={{ 
                        type: 'spring', 
                        stiffness: 120, 
                        damping: 20, 
                        mass: 0.8 
                      }}
                      style={{
                        fontFamily,
                        fontSize: isActive ? `${fontSize}px` : `${Math.max(24, fontSize * 0.7)}px`,
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
                        "select-none tracking-tight transition-colors duration-700 cursor-default px-4",
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
      {/* Buffering Indicator */}
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
      {/* Cinematic Overlays */}
      <div className="absolute inset-x-0 top-0 h-40 md:h-64 bg-gradient-to-b from-black via-black/80 to-transparent pointer-events-none z-20" />
      <div className="absolute inset-x-0 bottom-0 h-40 md:h-64 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-20" />
    </div>
  );
}