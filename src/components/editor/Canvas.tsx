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
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const activeIndex = useMemo(() => {
    if (!lyrics || lyrics.length === 0) return -1;
    let index = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (lyrics[i].time <= currentTime) {
        index = i;
      } else {
        break;
      }
    }
    return index;
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
  const animationVariants = {
    fade: {
      initial: { opacity: 0, filter: 'blur(10px)' },
      animate: { opacity: 1, filter: 'blur(0px)' },
      exit: { opacity: 0, filter: 'blur(10px)' },
    },
    slide: {
      initial: { opacity: 0, y: 40 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -40 },
    },
    zoom: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.2 },
    },
    blur: {
      initial: { opacity: 0, filter: 'blur(20px)', scale: 0.9 },
      animate: { opacity: 1, filter: 'blur(0px)', scale: 1 },
      exit: { opacity: 0, filter: 'blur(20px)', scale: 1.1 },
    }
  };
  const currentVariant = animationVariants[style.animationType] || animationVariants.fade;
  return (
    <div className="flex-1 bg-black flex items-center justify-center overflow-hidden relative group">
      {/* Interactive Grid Background */}
      <motion.div 
        animate={{ opacity: isPlaying ? 0.08 : 0.03 }}
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:60px_60px]" 
      />
      <div className="max-w-5xl px-12 z-10 w-full text-center flex flex-col items-center justify-center gap-12">
        <AnimatePresence mode="wait">
          {activeIndex !== -1 ? (
            <motion.div
              key={lyrics[activeIndex].time}
              initial={currentVariant.initial}
              animate={currentVariant.animate}
              exit={currentVariant.exit}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: style.fontFamily,
                fontSize: `${style.fontSize}px`,
                fontWeight: style.fontWeight,
                color: style.color,
                lineHeight: style.lineHeight,
                textAlign: style.textAlign,
                textTransform: style.textTransform,
                textShadow: style.glowIntensity > 0 
                  ? `${style.textShadow}, 0 0 ${style.glowIntensity}px ${style.glowColor}`
                  : style.textShadow
              }}
              className="select-none tracking-tight"
            >
              {lyrics[activeIndex].text}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              className="text-white/30 text-sm tracking-[0.5em] uppercase font-light"
            >
              {!track ? 'Search for a track' : lyrics.length > 0 ? 'Wait for audio sync' : 'Sync lyrics to start'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {isBuffering && (
        <div className="absolute top-8 right-8 flex items-center gap-2 text-white/40 text-xs font-mono uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full backdrop-blur-xl border border-white/10">
          <Loader2 className="w-3 h-3 animate-spin" />
          Synchronizing
        </div>
      )}
      {/* Aesthetic Framing */}
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black via-black/40 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
    </div>
  );
}