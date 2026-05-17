import React from 'react';
import { Sidebar } from '@/components/editor/Sidebar';
import { Canvas } from '@/components/editor/Canvas';
import { BottomPlayer } from '@/components/editor/BottomPlayer';
import { Toaster } from '@/components/ui/sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
export function HomePage() {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      {/* Top Header Overlay */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <ThemeToggle className="relative top-0 right-0" />
      </div>
      {/* Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <Canvas />
      </div>
      {/* Footer Player */}
      <BottomPlayer />
      <Toaster richColors position="top-right" />
    </div>
  );
}