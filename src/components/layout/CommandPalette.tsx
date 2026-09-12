import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TRANSLATIONS } from '../../i18n/translations';
import { NavigationSection } from '../../types';
import {
  Search,
  Compass,
  MessageSquare,
  FolderGit2,
  Bot,
  Files,
  ListTodo,
  Cpu,
  Brain,
  KeyRound,
  FileCheck2,
  Settings,
  X,
  Sliders,
  Globe,
  Sun,
  Moon,
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    locale,
    setLocale,
    theme,
    toggleTheme,
    mode,
    setMode,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setActiveSection,
  } = useApp();

  const [query, setQuery] = useState('');
  const t = TRANSLATIONS[locale];

  if (!isCommandPaletteOpen) return null;

  const quickNavs: Array<{ id: NavigationSection; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'overview', label: t.nav.overview, icon: Compass },
    { id: 'conversations', label: t.nav.conversations, icon: MessageSquare },
    { id: 'projects', label: t.nav.projects, icon: FolderGit2 },
    { id: 'assistants', label: t.nav.assistants, icon: Bot },
    { id: 'files', label: t.nav.files, icon: Files },
    { id: 'tasks', label: t.nav.tasks, icon: ListTodo },
    { id: 'tools', label: t.nav.tools, icon: Cpu },
    { id: 'memory', label: t.nav.memory, icon: Brain },
    { id: 'search', label: t.nav.search, icon: Search },
    { id: 'accounts', label: t.nav.accounts, icon: KeyRound },
    { id: 'audit', label: t.nav.audit, icon: FileCheck2 },
    { id: 'settings', label: t.nav.settings, icon: Settings },
  ];

  const filteredNavs = quickNavs.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-16 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
        {/* Search input */}
        <div className="flex items-center gap-2 border-b border-slate-100 px-3 pb-2 dark:border-slate-800">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
          />
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(false)}
            className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick navigation items */}
        <div className="max-h-72 overflow-y-auto p-1 space-y-0.5">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {locale === 'en' ? 'Workspace Navigation' : 'التنقل في مساحة العمل'}
          </div>

          {filteredNavs.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveSection(item.id);
                  setIsCommandPaletteOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-400 transition"
              >
                <Icon className="h-4 w-4 text-slate-400" />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Quick Actions */}
          <div className="mt-2 border-t border-slate-100 px-2 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800">
            {locale === 'en' ? 'Quick Actions' : 'إجراءات سريعة'}
          </div>

          <button
            type="button"
            onClick={() => {
              setMode(mode === 'simple' ? 'advanced' : 'simple');
              setIsCommandPaletteOpen(false);
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Sliders className="h-4 w-4 text-indigo-500" />
            <span>
              {mode === 'simple'
                ? locale === 'en' ? 'Switch to Advanced Mode' : 'التبديل إلى الوضع المتقدم'
                : locale === 'en' ? 'Switch to Simple Mode' : 'التبديل إلى الوضع البسيط'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLocale(locale === 'en' ? 'ar' : 'en');
              setIsCommandPaletteOpen(false);
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Globe className="h-4 w-4 text-emerald-500" />
            <span>{locale === 'en' ? 'تبديل الواجهة إلى العربية' : 'Switch interface to English'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              toggleTheme();
              setIsCommandPaletteOpen(false);
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-500" />
            ) : (
              <Moon className="h-4 w-4 text-slate-500" />
            )}
            <span>
              {theme === 'dark'
                ? locale === 'en' ? 'Switch to Light Mode' : 'التبديل للوضع الفاتح'
                : locale === 'en' ? 'Switch to Dark Mode' : 'التبديل للوضع الداكن'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
