import React, { useMemo, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
export function Canvas() {
  const lyrics = useEditorStore((s) => s.lyrics);
  const currentTime = useEditorStore((s) => s.currentTime);
  const style = useEditorStore((s) => s.style);
  const isBuffering = useEditorStore((s) => s.isBuffering);
  const track = useEditorStore((s) => s.track);
  // High-performance binary search for active lyric line
  const activeLine = useMemo(() => {
    if (!lyrics || lyrics.length === 0) return null;
    let low = 0;
    let high = lyrics.length - 1;
    let result = null;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (lyrics[mid].time <= currentTime) {
        result = lyrics[mid];
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return result;
  }, [lyrics, currentTime]);
  useEffect(() => {
    if (style.fontFamily) {
      const fontName = style.fontFamily.replace(/\s+/g, '+');
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
  }, [style.fontFamily]);
  const canvasStyle: React.CSSProperties = {
    fontFamily: style.fontFamily,
    fontSize: `${style.fontSize}px`,
    fontWeight: style.fontWeight,
    color: style.color,
    lineHeight: style.lineHeight,
    textAlign: style.textAlign,
    textTransform: style.textTransform,
  };
  return (
    <div className="flex-1 bg-black flex items-center justify-center overflow-hidden relative group cursor-none">
      {/* Dynamic Grid Background Overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:60px_60px]" />
      <div className="max-w-5xl px-12 z-10 w-full text-center">
        <AnimatePresence mode="wait">
          {activeLine ? (
            <motion.div
              key={activeLine.time}
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(12px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(12px)' }}
              transition={{
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1]
              }}
              style={canvasStyle}
              className="drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] select-none"
            >
              {activeLine.text}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              className="text-white/20 text-sm tracking-[0.4em] uppercase font-light"
            >
              {!track ? 'Search for a track' : lyrics.length > 0 ? 'Wait for it...' : 'Sync lyrics to preview'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {isBuffering && (
        <div className="absolute top-8 right-8 flex items-center gap-2 text-white/40 text-xs font-mono uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full backdrop-blur-md">
          <Loader2 className="w-3 h-3 animate-spin" />
          Buffering
        </div>
      )}
      {/* Aesthetic Framing */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black to-transparent pointer-events-none opacity-60" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none opacity-60" />
    </div>
  );
}