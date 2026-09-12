import React from 'react';
import { useApp } from '../../context/AppContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { CommandPalette } from './CommandPalette';
import { SectionViewContainer } from '../sections/SectionViewContainer';

export const Shell: React.FC = () => {
  const { isRTL } = useApp();

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors"
    >
      {/* Top Navbar */}
      <Navbar />

      {/* Main App Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop / Tablet Sidebar */}
        <Sidebar />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto px-4 py-5 md:px-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
          <SectionViewContainer />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette />
    </div>
  );
};
