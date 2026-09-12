import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { AppTheme, NavigationSection, SupportedLocale, UIMode, ProviderAccount, AIModel, AuditLogEntry, AppNotification } from '../types';

interface AppContextValue {
  locale: SupportedLocale; setLocale: (locale: SupportedLocale) => void; isRTL: boolean;
  theme: AppTheme; setTheme: (theme: AppTheme) => void; toggleTheme: () => void;
  mode: UIMode; setMode: (mode: UIMode) => void;
  activeSection: NavigationSection; setActiveSection: (section: NavigationSection) => void;
  accounts: ProviderAccount[]; models: AIModel[]; selectedModelIds: string[]; toggleModelSelection: (id: string) => void;
  refreshAccounts: () => Promise<void>; refreshModels: () => Promise<void>;
  testAccount: (id: string) => Promise<{ ok: boolean; modelCount?: number; error?: string }>;
  isCommandPaletteOpen: boolean; setIsCommandPaletteOpen: (open: boolean) => void;
  auditLogs: AuditLogEntry[]; addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  notifications: AppNotification[]; dismissNotification: (id: string) => void; addNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
}

const AppContext = createContext<AppContextValue | null>(null);
const API = '/api';
const STORAGE_KEYS = { LOCALE: 'ainexus_locale', THEME: 'ainexus_theme', MODE: 'ainexus_mode', MODELS: 'ainexus_selected_models' };

async function apiJson(path: string, options?: RequestInit) {
  const response = await fetch(`${API}${path}`, { headers: { 'content-type': 'application/json', ...(options?.headers || {}) }, ...options });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error || `Request failed (${response.status})`);
  return body;
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => localStorage.getItem(STORAGE_KEYS.LOCALE) === 'ar' ? 'ar' : 'en');
  const [theme, setThemeState] = useState<AppTheme>(() => localStorage.getItem(STORAGE_KEYS.THEME) === 'light' ? 'light' : 'dark');
  const [mode, setModeState] = useState<UIMode>(() => localStorage.getItem(STORAGE_KEYS.MODE) === 'advanced' ? 'advanced' : 'simple');
  const [activeSection, setActiveSection] = useState<NavigationSection>('overview');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [accounts, setAccounts] = useState<ProviderAccount[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.MODELS) || '[]'); } catch { return []; } });
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const isRTL = locale === 'ar';

  const refreshAccounts = async () => { const body = await apiJson('/accounts'); setAccounts(body.accounts || []); };
  const refreshModels = async () => {
    const body = await apiJson('/models');
    const discovered: AIModel[] = (body.models || []).map((m: any) => ({ id: m.id, providerId: m.providerId, name: m.name, description: m.description || '', contextWindow: m.contextWindow || m.inputTokenLimit || 0, maxOutputTokens: m.maxOutputTokens || m.outputTokenLimit || 0, capabilities: m.capabilities || ['chat'], isDefault: m.providerId === 'google_gemini' && m.id.endsWith(':dynamic') }));
    setModels(discovered);
  };
  const testAccount = async (id: string) => {
    try { const result = await apiJson(`/accounts/${id}/test`, { method: 'POST', body: '{}' }); return result; }
    catch (error) { return { ok: false, error: error instanceof Error ? error.message : 'Connection test failed.' }; }
  };

  useEffect(() => { refreshAccounts().catch(() => undefined); refreshModels().catch(() => undefined); }, []);
  useEffect(() => { document.documentElement.lang = locale; document.documentElement.dir = isRTL ? 'rtl' : 'ltr'; localStorage.setItem(STORAGE_KEYS.LOCALE, locale); }, [locale, isRTL]);
  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); localStorage.setItem(STORAGE_KEYS.THEME, theme); }, [theme]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.MODE, mode); }, [mode]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.MODELS, JSON.stringify(selectedModelIds)); }, [selectedModelIds]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setIsCommandPaletteOpen((v) => !v); } };
    window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler);
  }, []);

  const toggleModelSelection = (id: string) => setSelectedModelIds((prev) => prev.includes(id) ? (prev.length === 1 ? prev : prev.filter((x) => x !== id)) : [...prev, id]);
  const setLocale = (v: SupportedLocale) => setLocaleState(v);
  const setTheme = (v: AppTheme) => setThemeState(v);
  const toggleTheme = () => setThemeState((v) => v === 'dark' ? 'light' : 'dark');
  const setMode = (v: UIMode) => setModeState(v);
  const addAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => setAuditLogs((p) => [{ ...entry, id: crypto.randomUUID(), timestamp: new Date().toISOString() }, ...p]);
  const dismissNotification = (id: string) => setNotifications((p) => p.filter((n) => n.id !== id));
  const addNotification = (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => setNotifications((p) => [{ ...n, id: crypto.randomUUID(), createdAt: new Date().toISOString(), read: false }, ...p]);

  const value = useMemo(() => ({ locale, setLocale, isRTL, theme, setTheme, toggleTheme, mode, setMode, activeSection, setActiveSection, accounts, models, selectedModelIds, toggleModelSelection, refreshAccounts, refreshModels, testAccount, isCommandPaletteOpen, setIsCommandPaletteOpen, auditLogs, addAuditLog, notifications, dismissNotification, addNotification }), [locale, isRTL, theme, mode, activeSection, accounts, models, selectedModelIds, isCommandPaletteOpen, auditLogs, notifications]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextValue { const context = useContext(AppContext); if (!context) throw new Error('useApp must be used within an AppProvider'); return context; }
