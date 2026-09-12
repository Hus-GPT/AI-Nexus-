import { SupportedLocale } from '../types';

export interface Translations {
  appName: string;
  appTagline: string;
  simpleMode: string;
  advancedMode: string;
  searchPlaceholder: string;
  keyboardShortcutHint: string;
  nav: {
    overview: string;
    conversations: string;
    projects: string;
    assistants: string;
    files: string;
    tasks: string;
    tools: string;
    memory: string;
    search: string;
    accounts: string;
    audit: string;
    settings: string;
  };
  modes: {
    simpleDescription: string;
    advancedDescription: string;
  };
  header: {
    switchLanguage: string;
    switchTheme: string;
    notifications: string;
    commandPalette: string;
    activeProviderCount: string;
  };
  status: {
    ready: string;
    foundationPhase: string;
    providerAgnostic: string;
    securityEnforced: string;
    noUnrestrictedExecution: string;
  };
}

export const TRANSLATIONS: Record<SupportedLocale, Translations> = {
  en: {
    appName: 'AI Nexus',
    appTagline: 'Unified Provider-Agnostic AI Workspace',
    simpleMode: 'Simple Mode',
    advancedMode: 'Advanced Mode',
    searchPlaceholder: 'Search conversations, projects, assistants, files (Cmd+K)...',
    keyboardShortcutHint: 'Press Cmd+K for commands',
    nav: {
      overview: 'Architecture & Foundation',
      conversations: 'Conversations',
      projects: 'Projects',
      assistants: 'Assistants',
      files: 'Files & Artifacts',
      tasks: 'Tasks & Workflows',
      tools: 'Tools & MCP',
      memory: 'Memory Hub',
      search: 'Independent Search',
      accounts: 'Providers & Keys',
      audit: 'Audit Log',
      settings: 'Settings',
    },
    modes: {
      simpleDescription: 'Clean, focused ChatGPT-like conversational flow with manual model targeting.',
      advancedDescription: 'Expanded multi-model comparison, parameter tuning, context routing, and orchestration controls.',
    },
    header: {
      switchLanguage: 'Language',
      switchTheme: 'Toggle theme',
      notifications: 'Notifications',
      commandPalette: 'Command Palette',
      activeProviderCount: 'Providers Available',
    },
    status: {
      ready: 'System Ready',
      foundationPhase: 'Phase 0 Foundation Active',
      providerAgnostic: 'Provider Abstraction Active',
      securityEnforced: 'Strict Approval Guardrail Active',
      noUnrestrictedExecution: 'No Unrestricted Execution Permitted',
    },
  },
  ar: {
    appName: 'إي آي نيكسس',
    appTagline: 'منصة الذكاء الاصطناعي الموحدة والمستقلة عن المزودين',
    simpleMode: 'الوضع البسيط',
    advancedMode: 'الوضع المتقدم',
    searchPlaceholder: 'ابحث في المحادثات، المشاريع، المساعدين، والملفات (Cmd+K)...',
    keyboardShortcutHint: 'اضغط Cmd+K للأوامر',
    nav: {
      overview: 'المعمارية والتأسيس',
      conversations: 'المحادثات',
      projects: 'المشاريع',
      assistants: 'المساعدون',
      files: 'الملفات والمخرجات',
      tasks: 'المهام ومسارات العمل',
      tools: 'الأدوات وبروتوكول MCP',
      memory: 'مركز الذاكرة',
      search: 'البحث المستقل',
      accounts: 'المزودون والمفاتيح',
      audit: 'سجل التدقيق',
      settings: 'الإعدادات',
    },
    modes: {
      simpleDescription: 'واجهة محادثة بسيطة ومركزة مثل ChatGPT مع اختيار يدوي للنماذج.',
      advancedDescription: 'مقارنة رأسية متزامنة بين عدة نماذج، توجيه السياق، وضبط المعلمات والمهام.',
    },
    header: {
      switchLanguage: 'اللغة',
      switchTheme: 'تبديل المظهر',
      notifications: 'الإشعارات',
      commandPalette: 'لوحة الأوامر',
      activeProviderCount: 'المزودون المتاحون',
    },
    status: {
      ready: 'النظام جاهز',
      foundationPhase: 'المرحلة 0 التأسيسية مفعلة',
      providerAgnostic: 'طبقة التجريد المستقلة مفعلة',
      securityEnforced: 'نظام التدقيق والموافقات الصارمة مفعل',
      noUnrestrictedExecution: 'ممنوع التنفيذ الدائم غير المقيد',
    },
  },
};
