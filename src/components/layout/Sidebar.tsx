import React from 'react';
import { useApp } from '../../context/AppContext';
import { TRANSLATIONS } from '../../i18n/translations';
import { NavigationSection } from '../../types';
import {
  Compass,
  MessageSquare,
  FolderGit2,
  Bot,
  Files,
  ListTodo,
  Cpu,
  Brain,
  Search,
  KeyRound,
  FileCheck2,
  Settings,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  id: NavigationSection;
  labelKey: keyof typeof TRANSLATIONS['en']['nav'];
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', labelKey: 'overview', icon: Compass, badge: '25 Specs' },
  { id: 'conversations', labelKey: 'conversations', icon: MessageSquare },
  { id: 'projects', labelKey: 'projects', icon: FolderGit2 },
  { id: 'assistants', labelKey: 'assistants', icon: Bot },
  { id: 'files', labelKey: 'files', icon: Files },
  { id: 'tasks', labelKey: 'tasks', icon: ListTodo },
  { id: 'tools', labelKey: 'tools', icon: Cpu },
  { id: 'memory', labelKey: 'memory', icon: Brain },
  { id: 'search', labelKey: 'search', icon: Search },
  { id: 'accounts', labelKey: 'accounts', icon: KeyRound },
  { id: 'audit', labelKey: 'audit', icon: FileCheck2 },
  { id: 'settings', labelKey: 'settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { locale, isRTL, activeSection, setActiveSection, mode } = useApp();
  const t = TRANSLATIONS[locale];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-e border-slate-200 bg-white/70 backdrop-blur-xs p-3 dark:border-slate-800 dark:bg-slate-900/60 transition-all select-none">
      {/* Workspace Banner */}
      <div className="mb-3 rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5 dark:border-slate-800/80 dark:bg-slate-850/60">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {locale === 'en' ? 'Workspace' : 'مساحة العمل'}
          </span>
          <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
            {mode === 'advanced' ? t.advancedMode : t.simpleMode}
          </span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          {mode === 'advanced' ? t.modes.advancedDescription : t.modes.simpleDescription}
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          const label = t.nav[item.labelKey];

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
              className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold tracking-wide ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                <ChevronRight
                  className={`h-3 w-3 opacity-0 transition-opacity ${
                    isActive ? 'opacity-100' : 'group-hover:opacity-60'
                  } ${isRTL ? 'rotate-180' : ''}`}
                />
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="mt-auto border-t border-slate-200 pt-3 dark:border-slate-800">
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="truncate">{t.status.providerAgnostic}</span>
        </div>
      </div>
    </aside>
  );
};
