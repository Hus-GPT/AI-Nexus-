import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TRANSLATIONS } from '../../i18n/translations';
import {
  Sun,
  Moon,
  Globe,
  Search,
  Sliders,
  Sparkles,
  Bell,
  ShieldCheck,
  CheckCircle2,
  X,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    locale,
    setLocale,
    isRTL,
    theme,
    toggleTheme,
    mode,
    setMode,
    setIsCommandPaletteOpen,
    notifications,
    dismissNotification,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const t = TRANSLATIONS[locale];

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 transition-colors">
      {/* Brand & Mode Switcher */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 text-white shadow-sm shadow-blue-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              {t.appName}
            </span>
            <span className="hidden text-[10px] font-medium text-slate-500 dark:text-slate-400 sm:inline-block">
              {t.appTagline}
            </span>
          </div>
        </div>

        {/* Simple vs Advanced Mode Segmented Control */}
        <div className="mx-2 hidden sm:flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700/60 dark:bg-slate-800/80">
          <button
            type="button"
            onClick={() => setMode('simple')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
              mode === 'simple'
                ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-700 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {t.simpleMode}
          </button>
          <button
            type="button"
            onClick={() => setMode('advanced')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
              mode === 'advanced'
                ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-700 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="h-3 w-3" />
            {t.advancedMode}
          </button>
        </div>
      </div>

      {/* Global Search / Command Bar Trigger */}
      <div className="flex flex-1 max-w-md mx-3">
        <button
          type="button"
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 transition-all"
        >
          <span className="flex items-center gap-2 truncate">
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span className="truncate">{t.searchPlaceholder}</span>
          </span>
          <kbd className="hidden sm:inline-flex items-center rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-500 shadow-2xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            {isRTL ? 'K + ⌘' : '⌘K'}
          </kbd>
        </button>
      </div>

      {/* Right Controls: Language, Theme, Notifications, Status */}
      <div className="flex items-center gap-1.5">
        {/* Guardrail badge */}
        <div className="hidden lg:flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="h-3 w-3" />
          <span>{t.status.securityEnforced}</span>
        </div>

        {/* Language switch */}
        <button
          type="button"
          onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
          title={t.header.switchLanguage}
          className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
        >
          <Globe className="h-3.5 w-3.5 text-blue-500" />
          <span>{locale === 'en' ? 'العربية' : 'English'}</span>
        </button>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={t.header.switchTheme}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-600" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            title={t.header.notifications}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
          >
            <Bell className="h-4 w-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className={`absolute mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900 ${
                isRTL ? 'left-0' : 'right-0'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {t.header.notifications}
                </span>
                <span className="text-[10px] text-slate-400">{notifications.length} unread</span>
              </div>
              <div className="mt-2 max-h-64 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-400">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="group flex items-start justify-between rounded-lg bg-slate-50 p-2.5 text-xs dark:bg-slate-800/60"
                    >
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{n.message}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => dismissNotification(n.id)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
