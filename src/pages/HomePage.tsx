import React from 'react';
import { Sidebar } from '@/components/editor/Sidebar';
import { Canvas } from '@/components/editor/Canvas';
import { BottomPlayer } from '@/components/editor/BottomPlayer';
import { Toaster } from '@/components/ui/sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
export function HomePage() {
  // Always call hooks at top level for stability
  const isMobile = useIsMobile();
  useAudioEngine();
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      {/* Header / Mobile Controls */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full shadow-lg bg-background/80 backdrop-blur-md">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <Sidebar />
            </SheetContent>
          </Sheet>
        )}
        <ThemeToggle className="relative top-0 right-0" />
      </div>
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        {!isMobile && <Sidebar />}
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative min-w-0">
          <Canvas />
        </main>
      </div>
      {/* Fixed Bottom Player */}
      <BottomPlayer />
      <Toaster richColors position="top-right" />
    </div>
  );
}