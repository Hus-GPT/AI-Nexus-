import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TRANSLATIONS } from '../../i18n/translations';
import { ArchitectureViewer } from '../foundation/ArchitectureViewer';
import {
  MessageSquare,
  Sparkles,
  Send,
  Plus,
  Bot,
  FolderGit2,
  Files,
  ListTodo,
  Cpu,
  Brain,
  Search,
  KeyRound,
  FileCheck2,
  Settings,
  ShieldCheck,
  Check,
  AlertCircle,
  Sliders,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Copy,
  Layers,
} from 'lucide-react';
import { PROVIDER_CATALOG } from '../../services/providers/catalog';

export const SectionViewContainer: React.FC = () => {
  const {
    locale,
    activeSection,
    setActiveSection,
    mode,
    models,
    selectedModelIds,
    toggleModelSelection,
    accounts,
    auditLogs,
  } = useApp();

  const t = TRANSLATIONS[locale];
  const [chatInput, setChatInput] = useState('');
  const [contextForwardingEnabled, setContextForwardingEnabled] = useState(true);

  // If on overview, render the comprehensive architecture viewer
  if (activeSection === 'overview') {
    return <ArchitectureViewer />;
  }

  // Conversations Section
  if (activeSection === 'conversations') {
    return (
      <div className="flex flex-col h-[calc(100vh-8.5rem)] md:h-[calc(100vh-7.5rem)] justify-between space-y-4">
        {/* Header with Model Selector Chips */}
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {locale === 'en' ? 'Target Models for Message' : 'النماذج المستهدفة للرسالة'}
              </span>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
                {selectedModelIds.length} {locale === 'en' ? 'Selected' : 'محددة'}
              </span>
            </div>

            {/* Context forwarding controller */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                {locale === 'en' ? 'Context Forwarding:' : 'توجيه السياق:'}
              </span>
              <button
                type="button"
                onClick={() => setContextForwardingEnabled(!contextForwardingEnabled)}
                className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold transition ${
                  contextForwardingEnabled
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                }`}
              >
                {contextForwardingEnabled ? <Check className="h-3 w-3" /> : null}
                <span>{contextForwardingEnabled ? (locale === 'en' ? 'Enabled' : 'مفعل') : (locale === 'en' ? 'Isolated Turn' : 'منفصل')}</span>
              </button>
            </div>
          </div>

          {/* Model Chips (Manual Multi-Model Selection) */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {models.map((model) => {
              const isSelected = selectedModelIds.includes(model.id);
              const provider = PROVIDER_CATALOG[model.providerId];
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => toggleModelSelection(model.id)}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/80 text-blue-800 dark:border-blue-600 dark:bg-blue-950/60 dark:text-blue-200'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isSelected ? 'bg-blue-600 dark:bg-blue-400' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  />
                  <span>{model.name}</span>
                  {model.isDefault && (
                    <span className="rounded bg-slate-100 px-1 text-[9px] font-semibold text-slate-500 dark:bg-slate-800">
                      Default
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Empty State / Foundation Status */}
        <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 p-8 text-center dark:border-slate-800 dark:bg-slate-900/40">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
            {locale === 'en' ? 'Phase 0 Chat Foundation Ready' : 'أساس المحادثة جاهز للانتقال للمرحلة 1'}
          </h2>
          <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {locale === 'en'
              ? 'Multi-model selection, context forwarding contracts, and provider abstractions are loaded. In Phase 1, submitting a prompt will simultaneously query each selected model and render vertical stacked responses.'
              : 'تم تحميل واجهات اختيار النماذج المتعددة، وتوجيه السياق، وتجريد المزودين. في المرحلة 1، سيتم إرسال رسالتك متزامناً للنماذج المختارة وعرض الإجابات الرأسية للمقارنة والتوليف.'}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSection('overview')}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs"
            >
              <Layers className="h-3.5 w-3.5 text-blue-500" />
              <span>{locale === 'en' ? 'Inspect Architecture' : 'معاينة المخطط المعماري'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('accounts')}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs"
            >
              <KeyRound className="h-3.5 w-3.5 text-amber-500" />
              <span>{locale === 'en' ? 'Configure Provider Keys' : 'إعداد مفاتيح المزودين'}</span>
            </button>
          </div>
        </div>

        {/* ChatGPT-like Input Bar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 px-2 py-1">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={
                locale === 'en'
                  ? `Message ${selectedModelIds.length} model(s)... (Phase 0 foundation)`
                  : `إرسال إلى ${selectedModelIds.length} نموذج... (طور التأسيس)`
              }
              className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
            />
            <button
              type="button"
              title={locale === 'en' ? 'Send (Phase 1)' : 'إرسال (المرحلة 1)'}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Providers & Keys Section
  if (activeSection === 'accounts') {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-blue-600" />
                <span>{locale === 'en' ? 'AI Provider Accounts & API Keys' : 'حسابات ومفاتيح مزودي الذكاء الاصطناعي'}</span>
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {locale === 'en'
                  ? 'Bring Your Own Key (BYOK): You own your credentials. Keys are encrypted at rest with Web Crypto AES-GCM and never shared.'
                  : 'امتلاك المفاتيح الخاصة: بيانات الاعتماد ملك للمستخدم بالكامل، وتُشفَّر بأعلى درجات الأمان عبر AES-GCM.'}
              </p>
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{locale === 'en' ? 'Add Provider Account' : 'إضافة حساب مزود جديد'}</span>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.values(PROVIDER_CATALOG).map((provider) => {
              const account = accounts.find((a) => a.providerId === provider.id);
              return (
                <div
                  key={provider.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {provider.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {provider.description}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                        account
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {account ? (locale === 'en' ? 'Active' : 'مفعل') : (locale === 'en' ? 'Not Configured' : 'غير مهيأ')}
                    </span>
                  </div>

                  <div className="mt-4 border-t border-slate-200/80 pt-3 dark:border-slate-700/80 flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] text-slate-500">
                      {account ? account.apiKeyMasked : 'No API key set'}
                    </span>
                    <button
                      type="button"
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      {account ? (locale === 'en' ? 'Manage' : 'إدارة') : (locale === 'en' ? 'Setup Key' : 'إدخال المفتاح')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Audit Log Section
  if (activeSection === 'audit') {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-emerald-600" />
              <span>{locale === 'en' ? 'Tamper-Evident Audit Log' : 'سجل التدقيق والعمليات المحمية'}</span>
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {locale === 'en'
                ? 'All sensitive operations (key modifications, tool executions, approval decisions, data exports) are strictly recorded.'
                : 'يتم تسجيل وتوثيق جميع العمليات الحساسة (تغيير المفاتيح، الموافقات، تشغيل الأدوات، والتصدير) بسجل غير قابل للتلاعب.'}
            </p>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between text-xs gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                        log.severity === 'warning'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {log.targetEntity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {JSON.stringify(log.details)}
                  </p>
                </div>
                <span className="font-mono text-[10px] text-slate-400 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Generic Foundation Container for remaining core modules
  const getSectionMetadata = () => {
    switch (activeSection) {
      case 'projects':
        return {
          icon: FolderGit2,
          title: locale === 'en' ? 'Projects & Workspaces' : 'المشاريع ومساحات العمل',
          desc: locale === 'en' ? 'Isolated workspace containers holding files, custom instructions, assistants, and project-scoped memory.' : 'مساحات عمل مستقلة تحتوي الملفات والتعليمات والمساعدين والذاكرة الخاصة بالمشروع.',
        };
      case 'assistants':
        return {
          icon: Bot,
          title: locale === 'en' ? 'Assistants Hub' : 'مركز المساعدين المخصصين',
          desc: locale === 'en' ? 'Autonomous AI entities with pinned models, knowledge bases, custom tools, and scoped personas.' : 'كيانات ذكاء اصطناعي متكاملة ذات طابع وأدوات ومصادر معرفية ونماذج مفضلة.',
        };
      case 'files':
        return {
          icon: Files,
          title: locale === 'en' ? 'Persistent Files & Artifact Library' : 'مكتبة الملفات والمخرجات الدائمة',
          desc: locale === 'en' ? 'Persistent repository for uploaded documents, code files, and generated artifacts with versioning.' : 'مستودع دائم للمستندات والملفات والمخرجات البرمجية مع تتبع الإصدارات.',
        };
      case 'tasks':
        return {
          icon: ListTodo,
          title: locale === 'en' ? 'Long-Running Tasks & Workflows' : 'المهام ومسارات العمل متعددة الخطوات',
          desc: locale === 'en' ? 'Multi-step orchestrator with checkpointing, pause/resume, and human approval gates.' : 'محرك تنفيذ متسلسل للخطوات المعقدة مع بوابات موافقة بشرية وإمكانية الاستئناف.',
        };
      case 'tools':
        return {
          icon: Cpu,
          title: locale === 'en' ? 'Tools & Integrations (MCP / APIs)' : 'الأدوات والتكاملات وبروتوكول MCP',
          desc: locale === 'en' ? 'Model Context Protocol, REST adapters, and webhooks with strict approval enforcement (no unrestricted execution).' : 'تكاملات MCP وREST مع فرض بوابات موافقة صارمة وحظر التنفيذ الدائم غير المقيد.',
        };
      case 'memory':
        return {
          icon: Brain,
          title: locale === 'en' ? 'Scoped Memory Hub' : 'مركز الذاكرة المنظمة',
          desc: locale === 'en' ? 'Transparent User, Project, Assistant, and Conversation memories with full user verification and editability.' : 'ذاكرة شفافة للمستخدم والمشروع والمساعد خاضعة للمعاينة والتعديل المباشر.',
        };
      case 'search':
        return {
          icon: Search,
          title: locale === 'en' ? 'Independent Web Search' : 'محرك البحث المستقل',
          desc: locale === 'en' ? 'Provider-agnostic live search requiring user approval before firing queries, extracting citations for models.' : 'محرك بحث ويب يتطلب موافقة المستخدم قبل التنفيذ، ويلخص المصادر للنماذج.',
        };
      case 'settings':
      default:
        return {
          icon: Settings,
          title: locale === 'en' ? 'Platform Settings & Portability' : 'إعدادات المنصة وقابلية النقل',
          desc: locale === 'en' ? 'Theme, locale, PWA install prompt, full JSON backup/restore, and security parameters.' : 'المظهر، اللغة، خيارات تثبيت تطبيق الويب PWA، وتصدير/استيراد البيانات بنقرة واحدة.',
        };
    }
  };

  const meta = getSectionMetadata();
  const Icon = meta.icon;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{meta.title}</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{meta.desc}</p>
          </div>
        </div>

        {/* Foundation Notification Card */}
        <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>{locale === 'en' ? 'Foundation Specification Active' : 'مواصفة التأسيس مفعلة'}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {locale === 'en'
              ? 'This module is fully specified under the 25-section architecture plan. In accordance with the Owner\'s instructions, live backend execution and synthetic mock data are withheld until the architecture proposal is reviewed and Phase 1 is authorized.'
              : 'تم توثيق هذه الوحدة بالكامل ضمن الخطة المعمارية ذات الـ 25 نطاقاً. التزاماً بتوجيهات المالك، تم تجنب وضع بيانات وهمية لحين مراجعة المخطط والموافقة على بدء المرحلة 1.'}
          </p>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => setActiveSection('overview')}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{locale === 'en' ? 'View Architecture Blueprint' : 'استعراض المخطط المعماري الكامل'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
