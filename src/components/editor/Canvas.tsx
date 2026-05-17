import React, { useMemo, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { motion, AnimatePresence } from 'framer-motion';
export function Canvas() {
  const lyrics = useEditorStore((s) => s.lyrics);
  const currentTime = useEditorStore((s) => s.currentTime);
  const style = useEditorStore((s) => s.style);
  // Find the current active line based on time
  const activeLine = useMemo(() => {
    if (!lyrics || lyrics.length === 0) return null;
    // Find the last lyric that has a time <= currentTime
    let lastActive = null;
    for (const line of lyrics) {
      if (line.time <= currentTime) {
        lastActive = line;
      } else {
        break;
      }
    }
    return lastActive;
  }, [lyrics, currentTime]);
  // Inject Google Fonts
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
    <div className="flex-1 bg-black flex items-center justify-center overflow-hidden relative group">
      {/* Dynamic Grid Background Overlay (Visual Polish) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="max-w-4xl px-8 z-10 w-full">
        <AnimatePresence mode="wait">
          {activeLine ? (
            <motion.div
              key={activeLine.time}
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ 
                duration: 0.6, 
                ease: [0.22, 1, 0.36, 1] 
              }}
              style={canvasStyle}
              className="drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              {activeLine.text}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              className="text-white/30 text-xl italic font-display tracking-widest uppercase"
            >
              {lyrics.length > 0 ? 'Intro...' : 'Load lyrics to preview'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Guide Lines (Visual Only) */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-y border-white/[0.03] h-24 pointer-events-none hidden group-hover:block transition-all" />
    </div>
  );
}