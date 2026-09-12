import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TRANSLATIONS } from '../../i18n/translations';
import { NavigationSection } from '../../types';
import {
  Compass,
  MessageSquare,
  FolderGit2,
  Cpu,
  Menu,
  X,
  Bot,
  Files,
  ListTodo,
  Brain,
  Search,
  KeyRound,
  FileCheck2,
  Settings,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { locale, activeSection, setActiveSection } = useApp();
  const t = TRANSLATIONS[locale];
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const mainTabs: Array<{ id: NavigationSection; icon: React.ComponentType<{ className?: string }>; label: string }> = [
    { id: 'overview', icon: Compass, label: t.nav.overview.split(' ')[0] },
    { id: 'conversations', icon: MessageSquare, label: t.nav.conversations },
    { id: 'projects', icon: FolderGit2, label: t.nav.projects },
    { id: 'tools', icon: Cpu, label: t.nav.tools.split(' ')[0] },
  ];

  const allSections: Array<{ id: NavigationSection; icon: React.ComponentType<{ className?: string }>; label: string }> = [
    { id: 'overview', icon: Compass, label: t.nav.overview },
    { id: 'conversations', icon: MessageSquare, label: t.nav.conversations },
    { id: 'projects', icon: FolderGit2, label: t.nav.projects },
    { id: 'assistants', icon: Bot, label: t.nav.assistants },
    { id: 'files', icon: Files, label: t.nav.files },
    { id: 'tasks', icon: ListTodo, label: t.nav.tasks },
    { id: 'tools', icon: Cpu, label: t.nav.tools },
    { id: 'memory', icon: Brain, label: t.nav.memory },
    { id: 'search', icon: Search, label: t.nav.search },
    { id: 'accounts', icon: KeyRound, label: t.nav.accounts },
    { id: 'audit', icon: FileCheck2, label: t.nav.audit },
    { id: 'settings', icon: Settings, label: t.nav.settings },
  ];

  return (
    <>
      {/* Bottom Bar for Mobile / Android Viewport */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 px-2 pb-safe backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveSection(tab.id);
                setIsDrawerOpen(false);
              }}
              className={`flex min-h-[44px] flex-col items-center justify-center gap-1 px-3 py-1 text-[11px] font-medium transition-all ${
                isActive ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}

        {/* More Drawer Trigger */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="flex min-h-[44px] flex-col items-center justify-center gap-1 px-3 py-1 text-[11px] font-medium text-slate-500 dark:text-slate-400"
        >
          <Menu className="h-5 w-5" />
          <span>{locale === 'en' ? 'More' : 'المزيد'}</span>
        </button>
      </nav>

      {/* Full Sheet / Drawer for More Items */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs md:hidden">
          <div className="max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in slide-in-from-bottom duration-200">
            <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {locale === 'en' ? 'All Workspace Areas' : 'جميع أقسام المنصة'}
              </span>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pb-6">
              {allSections.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => {
                      setActiveSection(sec.id);
                      setIsDrawerOpen(false);
                    }}
                    className={`flex items-center gap-2.5 rounded-xl border p-3 text-start text-xs font-semibold transition ${
                      isActive
                        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-300'
                        : 'border-slate-200 bg-slate-50/70 text-slate-700 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-blue-500" />
                    <span className="truncate">{sec.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
