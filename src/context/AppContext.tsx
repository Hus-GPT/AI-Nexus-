import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import {
  AppTheme,
  NavigationSection,
  SupportedLocale,
  UIMode,
  ProviderAccount,
  AIModel,
  AuditLogEntry,
  AppNotification,
} from '../types';
import { INITIAL_MODEL_REGISTRY } from '../services/providers/catalog';

interface AppContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  isRTL: boolean;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  mode: UIMode;
  setMode: (mode: UIMode) => void;
  activeSection: NavigationSection;
  setActiveSection: (section: NavigationSection) => void;
  accounts: ProviderAccount[];
  models: AIModel[];
  selectedModelIds: string[];
  toggleModelSelection: (modelId: string) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  auditLogs: AuditLogEntry[];
  addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  notifications: AppNotification[];
  dismissNotification: (id: string) => void;
  addNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEYS = {
  LOCALE: 'ainexus_locale',
  THEME: 'ainexus_theme',
  MODE: 'ainexus_mode',
  ACCOUNTS: 'ainexus_accounts',
  MODELS: 'ainexus_selected_models',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOCALE);
    return saved === 'ar' || saved === 'en' ? saved : 'en';
  });

  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark';
  });

  const [mode, setModeState] = useState<UIMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MODE);
    return saved === 'advanced' ? 'advanced' : 'simple';
  });

  const [activeSection, setActiveSection] = useState<NavigationSection>('overview');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Initial user-configured accounts (clean initial state, ready for user key entry)
  const [accounts] = useState<ProviderAccount[]>([
    {
      id: 'acc-gemini-default',
      providerId: 'google_gemini',
      accountLabel: 'Google Cloud / AI Studio Key',
      apiKeyMasked: 'AIzaSy•••••••••••••••••W9k',
      isValidated: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastValidatedAt: new Date().toISOString(),
    },
  ]);

  const [models] = useState<AIModel[]>(INITIAL_MODEL_REGISTRY);

  // Default selected models: Gemini is default as specified
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>(['gemini-2.5-flash']);

  // Audit trail
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'audit-001',
      timestamp: new Date().toISOString(),
      actor: 'system',
      action: 'api_key_added',
      severity: 'info',
      targetEntity: 'ProviderAccount:acc-gemini-default',
      details: { provider: 'google_gemini', keyType: 'user_supplied' },
    },
    {
      id: 'audit-002',
      timestamp: new Date().toISOString(),
      actor: 'system',
      action: 'tool_approval_denied',
      severity: 'warning',
      targetEntity: 'ToolSecurityPolicy:unrestricted_execution',
      details: { reason: 'Policy enforcement: No unrestricted permanent execution mode permitted.' },
    },
  ]);

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: 'Architectural Blueprint Ready',
      message: 'AI Nexus foundation initialized with strict provider abstraction, Web + Android strategy, and Arabic/English typography.',
      type: 'info',
      read: false,
      createdAt: new Date().toISOString(),
      actionLink: { section: 'overview' },
    },
  ]);

  const isRTL = locale === 'ar';

  // Synchronize document dir and lang attributes
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    localStorage.setItem(STORAGE_KEYS.LOCALE, locale);
  }, [locale, isRTL]);

  // Synchronize dark theme class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Keyboard shortcut for Command Palette (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
  };

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setMode = (newMode: UIMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEYS.MODE, newMode);
  };

  const toggleModelSelection = (modelId: string) => {
    setSelectedModelIds((prev) => {
      if (prev.includes(modelId)) {
        // Keep at least one selected model
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== modelId);
      } else {
        return [...prev, modelId];
      }
    });
  };

  const addAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const addNotification = (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    const notif: AppNotification = {
      ...n,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      isRTL,
      theme,
      setTheme,
      toggleTheme,
      mode,
      setMode,
      activeSection,
      setActiveSection,
      accounts,
      models,
      selectedModelIds,
      toggleModelSelection,
      isCommandPaletteOpen,
      setIsCommandPaletteOpen,
      auditLogs,
      addAuditLog,
      notifications,
      dismissNotification,
      addNotification,
    }),
    [
      locale,
      isRTL,
      theme,
      mode,
      activeSection,
      accounts,
      models,
      selectedModelIds,
      isCommandPaletteOpen,
      auditLogs,
      notifications,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
