import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  Cpu,
  ShieldAlert,
  Sparkles,
  Search,
  CheckCircle2,
  Workflow,
  KeyRound,
  FileCode2,
  Share2,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PROVIDER_CATALOG } from '../../services/providers/catalog';

interface ArchitectureSection {
  number: number;
  titleEn: string;
  titleAr: string;
  category: 'core' | 'execution' | 'data_security' | 'platform';
  summaryEn: string;
  summaryAr: string;
  keyPointsEn: string[];
  keyPointsAr: string[];
}

const ARCHITECTURE_SECTIONS: ArchitectureSection[] = [
  {
    number: 1,
    titleEn: 'Product Architecture',
    titleAr: 'معمارية المنتج',
    category: 'core',
    summaryEn: 'Unified client-first orchestration workspace with pluggable server-side proxies, strict security boundaries, and decoupled modular subsystems.',
    summaryAr: 'مساحة عمل موحدة تركز على العميل مع وسطاء سيرفر مؤمنة، ونطاقات أمان صارمة، وأنظمة فرعية مفككة.',
    keyPointsEn: [
      'Layered modular decoupling: Presentation Shell -> Orchestration Core -> Provider Abstraction -> Execution Adapters.',
      'Stateless execution bridges ensuring no provider vendor lock-in.',
      'Universal event bus for real-time streaming, task status transitions, and audit telemetry.',
    ],
    keyPointsAr: [
      'فصل معياري طبقي: واجهة العرض -> محرك التنسيق -> طبقة تجريد المزودين -> محولات التنفيذ.',
      'جسور تنفيذ عديمة الحالة تضمن عدم الارتهان لأي مزود ذكاء اصطناعي.',
      'ناقل أحداث شامل للبث الحي، وانتقال حالات المهام، وتدقيق العمليات.',
    ],
  },
  {
    number: 2,
    titleEn: 'Major Application Modules',
    titleAr: 'الوحدات الرئيسية للمنصة',
    category: 'core',
    summaryEn: '12 core decoupled modules: Conversations, Projects, Assistants, Files & Artifacts, Tasks, Tools/MCP, Memory Hub, Search, Accounts/Keys, Notifications, Audit, Settings.',
    summaryAr: '12 وحدة معمارية مستقلة تغطي المحادثات، المشاريع، المساعدين، الملفات، المهام، الأدوات، الذاكرة، البحث، المفاتيح، والتدقيق.',
    keyPointsEn: [
      'Each module maintains its own domain contracts, state lifecycle, and storage partitioning.',
      'Cross-module interactions mediated through explicit permissions and capability tokens.',
    ],
    keyPointsAr: [
      'تحتفظ كل وحدة بتعريفات المجال الخاصة بها، ودورة حياة الحالة، وتجزئة التخزين.',
      'التفاعل بين الوحدات يتم حصراً عبر رموز الصلاحيات والموافقات الصريحة.',
    ],
  },
  {
    number: 3,
    titleEn: 'Frontend Architecture',
    titleAr: 'معمارية الواجهة الأمامية',
    category: 'platform',
    summaryEn: 'High-performance React 19 + TypeScript architecture with Tailwind CSS v4, Motion layout transitions, and instant bilingual LTR/RTL support.',
    summaryAr: 'معمارية حديثة مبنية على React 19 وTypeScript مع Tailwind CSS v4 وانتقالات Motion ودعم فوري لـ LTR/RTL.',
    keyPointsEn: [
      'Adaptive Dual-Mode interface: Simple Mode (focused single stream) & Advanced Mode (multi-model split/orchestrator).',
      'Virtual scrolling for unbounded conversation turns and multi-model comparison grids.',
      'Zero layout shifts (CLS < 0.01) with skeleton placeholders and streaming token diffing.',
    ],
    keyPointsAr: [
      'واجهة مزدوجة متكيفة: الوضع البسيط (محادثة مركزة) والوضع المتقدم (مقارنة نماذج متعددة).',
      'تمرير افتراضي للمحادثات الطويلة وشبكات المقارنة الرأسية المتعددة.',
      'انعدام الإزاحة البصرية أثناء البث عبر حجز المساحات وضخ الرموز الانسيابي.',
    ],
  },
  {
    number: 4,
    titleEn: 'Backend / Server Architecture',
    titleAr: 'معمارية الخادم والواجهة الخلفية',
    category: 'platform',
    summaryEn: 'Lightweight, stateless API proxy and task execution daemon in Express/Node.js, isolating secrets from browser environments.',
    summaryAr: 'خادم وسيط خفيف وعديم الحالة لعزل المفاتيح السرية والتنفيذ الآمن للمهام والأدوات.',
    keyPointsEn: [
      'Server-side proxy routes for all external AI provider calls to prevent API key leakage.',
      'Server-Sent Events (SSE) stream multiplexing supporting concurrent multi-model streaming.',
      'MCP (Model Context Protocol) client bridge connecting local or remote tool servers.',
    ],
    keyPointsAr: [
      'مسارات وسيطة من جهة الخادم لجميع اتصالات المزودين لمنع تسريب المفاتيح للمتصفح.',
      'بث متعدد عبر أحداث الخادم (SSE) يدعم البث المتزامن لعدة نماذج بالوقت نفسه.',
      'جسر بروتوكول سياق النماذج (MCP) لربط خوادم الأدوات المحلية والبعيدة.',
    ],
  },
  {
    number: 5,
    titleEn: 'Data & Storage Architecture',
    titleAr: 'معمارية البيانات والتخزين',
    category: 'data_security',
    summaryEn: 'Tiered persistence strategy: Local encrypted cache (IndexedDB) for rapid offline navigation paired with durable cloud storage.',
    summaryAr: 'استراتيجية تخزين متعددة المستويات: تخزين محلي مشفر (IndexedDB) للعمل السريع دون اتصال مع تزامن سحابي موثوق.',
    keyPointsEn: [
      'Local-first resilience with optimistic updates and background synchronization.',
      'Zero proprietary lock-in: Schema exported as standard JSON/SQLite format anytime.',
    ],
    keyPointsAr: [
      'مرونة تركز على العميل (Local-first) مع تحديثات تفاؤلية وتزامن في الخلفية.',
      'انعدام الارتهان: تصدير كامل البيانات بهيئة JSON القياسية في أي وقت بنقرة واحدة.',
    ],
  },
  {
    number: 6,
    titleEn: 'AI Provider & Model Abstraction',
    titleAr: 'طبقة تجريد المزودين والنماذج (الحرجة)',
    category: 'execution',
    summaryEn: 'CRITICAL MANDATE: Unified IAIProviderAdapter contract decoupling the core application from any single AI vendor.',
    summaryAr: 'المبدأ الحاسم: واجهة موحدة تجرد التطبيق تماماً وتمنع تقييده بجوجل أو غيرها.',
    keyPointsEn: [
      'Normalized completion and streaming interfaces across Gemini, OpenAI, Anthropic, xAI, DeepSeek, Ollama, and OpenRouter.',
      'Dynamic ProviderRegistry allowing adding new models/providers without code refactoring.',
      'Standardized token counting, error codes, reasoning tokens, and tool schemas.',
    ],
    keyPointsAr: [
      'واجهة قياسية موحدة للبث والإكمال عبر Gemini وOpenAI وAnthropic وxAI وDeepSeek وOllama.',
      'سجل مزودين ديناميكي (ProviderRegistry) لإضافة نماذج جديدة فورياً دون تعديل الكود.',
      'توحيد حساب الرموز وتنسيق أخطاء الشبكة وأدوات الاستدعاء وسلاسل التفكير.',
    ],
  },
  {
    number: 7,
    titleEn: 'Account & API-Key Architecture',
    titleAr: 'معمارية الحسابات ومفاتيح المستخدم',
    category: 'data_security',
    summaryEn: 'BYOK (Bring Your Own Key) model where the user strictly owns and controls credentials with client/server-isolated encryption.',
    summaryAr: 'نموذج امتلاك المستخدم لمفاتيحه الخاصة مع تشفير كامل وعزل تام.',
    keyPointsEn: [
      'Support for multiple accounts per provider (e.g. personal Gemini vs enterprise Gemini, work OpenAI vs private OpenAI).',
      'Zero vendor key storage: Keys stored masked in UI, encrypted at rest via Web Crypto AES-GCM.',
    ],
    keyPointsAr: [
      'دعم حسابات ومفاتيح متعددة لكل مزود (مثل حساب شخصي وآخر للعمل لنفس المزود).',
      'حجب المفاتيح عن الشاشة وتشفيرها محلياً بواسطة AES-GCM عبر Web Crypto API.',
    ],
  },
  {
    number: 8,
    titleEn: 'Conversation & Context Architecture',
    titleAr: 'معمارية المحادثة وتوجيه السياق',
    category: 'execution',
    summaryEn: 'Granular context management enabling selective history forwarding between models and conversational branching.',
    summaryAr: 'إدارة دقيقة للسياق تتيح التحكم الدقيق بما يتم تمريره من تاريخ المحادثة بين النماذج.',
    keyPointsEn: [
      'Explicit user controls over context forwarding (exclude prior turns, forward only summaries, or isolate single prompt).',
      'Vertical multi-model response anchoring to a single user message.',
    ],
    keyPointsAr: [
      'تحكم صريح من المستخدم في تمرير السياق (تضمين/استبعاد الردود السابقة أو إرسال ملخص فقط).',
      'ربط رأسي لردود النماذج المتعددة تحت رسالة المستخدم الواحدة لتسهيل المقارنة.',
    ],
  },
  {
    number: 9,
    titleEn: 'Multi-Model Execution Architecture',
    titleAr: 'معمارية التنفيذ المتعدد والتوليف',
    category: 'execution',
    summaryEn: 'Simultaneous asynchronous dispatch to selected models with independent streaming buffers, individual regeneration, and unified synthesis.',
    summaryAr: 'إرسال متزامن للرسالة إلى عدة نماذج مع بث مستقل، وإمكانية إعادة التوليد، وتوليف الإجابات.',
    keyPointsEn: [
      'Concurrent Promise.allSettled pipeline multiplexing independent streaming channels.',
      'One-click Model Synthesis: Feed multiple model responses into an arbiter model to extract consensus and best points.',
      'Individual retry/regenerate controls per model card without re-running other models.',
    ],
    keyPointsAr: [
      'مسار غير متزامن يبث ردود كل نموذج على حدة دون تأخير أي نموذج لآخر.',
      'توليف الردود بنقرة واحدة: تمرير ردود النماذج إلى نموذج محدد لصياغة خلاصة جامعة.',
      'أزرار إعادة توليد منفصلة لكل بطاقة نموذج دون التأثير على بقية الإجابات.',
    ],
  },
  {
    number: 10,
    titleEn: 'Memory Architecture',
    titleAr: 'معمارية الذاكرة المنظمة',
    category: 'data_security',
    summaryEn: 'Multi-tiered scoped memory (User, Project, Assistant, Conversation) under transparent, direct user inspection and editability.',
    summaryAr: 'ذاكرة متعددة النطاقات (مستخدم، مشروع، مساعد، محادثة) خاضعة للمعاينة والتعديل المباشر.',
    keyPointsEn: [
      'Hierarchical scoping: User-global facts -> Project-specific guidelines -> Assistant persona -> Conversation turn state.',
      'User verification badge: Memories must be viewable, editable, or revokable at any moment.',
    ],
    keyPointsAr: [
      'تدرج هرمي: معلومات عامة للمستخدم -> إرشادات المشروع -> طابع المساعد -> سياق المحادثة.',
      'تحكم شفاف: يمكن للمستخدم استعراض كل حقيقة محفوظة، وتعديلها أو حذفها فورياً.',
    ],
  },
  {
    number: 11,
    titleEn: 'File & Artifact Architecture',
    titleAr: 'معمارية مكتبة الملفات والمخرجات',
    category: 'data_security',
    summaryEn: 'Unified persistent file repository and generated artifact library with versioning, cross-project referencing, and MIME-aware parsers.',
    summaryAr: 'مستودع ملفات موحد ومكتبة مخرجات برمجية ومستندية مع تتبع الإصدارات وتحديد الصلاحيات.',
    keyPointsEn: [
      'Scoped attachment permissions: Files can be attached globally, per-project, or per-assistant.',
      'Artifact generation engine with syntax highlighting, live preview, version diffs, and export.',
    ],
    keyPointsAr: [
      'صلاحيات استخدام الملفات محددة بدقة (على مستوى المنصة أو المشروع أو المساعد فقط).',
      'محرك مخرجات متقدم يدعم المعاينة الحية للأكواد والمستندات ومقارنة الفروقات بين الإصدارات.',
    ],
  },
  {
    number: 12,
    titleEn: 'Assistant Architecture',
    titleAr: 'معمارية المساعدين المخصصين',
    category: 'execution',
    summaryEn: 'Assistants designed as comprehensive standalone entities rather than simple saved prompts.',
    summaryAr: 'المساعدون كيانات متكاملة مستقلة ذات شخصية وأدوات وملفات معرفية وذاكرة خاصة.',
    keyPointsEn: [
      'Assistant entity comprises: Identity, pinned model preferences, system prompts, specific tool bindings, knowledge bases, and scoped memory.',
      'Exportable and shareable as portable Assistant manifest packages.',
    ],
    keyPointsAr: [
      'يشمل المساعد: الهوية، النماذج المفضلة، موجه النظام، الأدوات المصرح بها، الملفات، والذاكرة.',
      'إمكانية تصدير ومشاركة المساعد كحزمة مستقلة ومعيارية.',
    ],
  },
  {
    number: 13,
    titleEn: 'Project Architecture',
    titleAr: 'معمارية المشاريع ومساحات العمل',
    category: 'core',
    summaryEn: 'Isolated workspaces encapsulating conversations, files, scoped assistants, instructions, memories, and produced artifacts.',
    summaryAr: 'مساحات عمل معزولة تجمع المحادثات والملفات والمساعدين والتعليمات والذاكرة في سياق محدد.',
    keyPointsEn: [
      'Zero accidental context leakage between projects.',
      'Independent workspace-level instructions automatically injected into all project runs.',
    ],
    keyPointsAr: [
      'منع أي تسريب للمعلومات أو السياق بين المشاريع المختلفة.',
      'تعليمات خاصة بالمشروع تُحقن تلقائياً في جميع محادثات ومهام ذلك المشروع.',
    ],
  },
  {
    number: 14,
    titleEn: 'Task & Orchestration Architecture',
    titleAr: 'معمارية المهام المعقدة والتشغيل المتعدد الخطوات',
    category: 'execution',
    summaryEn: 'Stateful, resilient long-running task orchestrator supporting step checkpoints, pause/resume, approval gates, retries, and artifacts.',
    summaryAr: 'محرك مهام طويل الأمد يدعم حفظ التقدم، الإيقاف والاستئناف، بوابات الموافقة، وإعادة المحاولة.',
    keyPointsEn: [
      'DAG (Directed Acyclic Graph) step execution with checkpoint persistence.',
      'Human-in-the-loop approval gates before sensitive actions execute.',
      'Resumable state machine surviving network dropouts or browser tab restarts.',
    ],
    keyPointsAr: [
      'تنفيذ تخطيطي متسلسل للخطوات مع حفظ الحالة عند كل مرحلة.',
      'بوابات موافقة بشرية ملزمة قبل تنفيذ أي خطوة ذات حساسية.',
      'آلة حالة قابلة للاستئناف تواصل العمل بسلاسة حتى بعد انقطاع الاتصال أو إغلاق المتصفح.',
    ],
  },
  {
    number: 15,
    titleEn: 'Tools & Integrations Architecture (MCP, APIs)',
    titleAr: 'معمارية الأدوات والتكاملات وبروتوكول MCP',
    category: 'execution',
    summaryEn: 'Universal integration subsystem supporting Model Context Protocol (MCP), REST APIs, OAuth, Webhooks, and custom tool adapters.',
    summaryAr: 'نظام تكاملات شامل يدعم بروتوكول MCP وواجهات REST وOAuth ومحولات الأدوات البرمجية.',
    keyPointsEn: [
      'STRICT NO-UNRESTRICTED MODE: Every tool execution requires explicit user consent or a tightly scoped temporary permission.',
      'Detailed pre-execution parameter inspection and risk-level grading.',
    ],
    keyPointsAr: [
      'حظر تام لأي تنفيذ دائم غير مقيد: كل تشغيل يتطلب موافقة صريحة أو إذناً مؤقتاً ومحدداً.',
      'فحص كامل للمدخلات والمعاملات وتقييم مستوى الخطر قبل التشغيل.',
    ],
  },
  {
    number: 16,
    titleEn: 'Search Architecture',
    titleAr: 'معمارية البحث المستقل على الويب',
    category: 'execution',
    summaryEn: 'Provider-agnostic web search capability that requires user approval before firing queries, formatting synthesized briefs for models.',
    summaryAr: 'محرك بحث ويب مستقل يتطلب موافقة المستخدم قبل التنفيذ، ويلخص المصادر للنماذج.',
    keyPointsEn: [
      'Decoupled search providers: Brave Search, Google Custom Search, Tavily, SerpAPI.',
      'Clean citation extraction and grounding summary generation prior to model consumption.',
    ],
    keyPointsAr: [
      'مزودو بحث متعددون قابلون للتبديل: Brave وGoogle وTavily وSerpAPI.',
      'استخراج الاستشهادات والروابط وتلخيص النتائج قبل إرسالها لأي نموذج.',
    ],
  },
  {
    number: 17,
    titleEn: 'Voice Architecture',
    titleAr: 'معمارية التفاعل الصوتي الاحترافي',
    category: 'execution',
    summaryEn: 'Low-latency real-time voice streaming and speech-to-text / text-to-speech engine supporting multilingual Arabic and English audio.',
    summaryAr: 'محرك تفاعل صوتي منخفض الكمون يدعم تحويل الصوت لنص والعكس باللغتين العربية والإنجليزية.',
    keyPointsEn: [
      'Web Audio API / MediaRecorder capture with client-side VAD (Voice Activity Detection).',
      'Pluggable STT/TTS providers (Whisper, Gemini Live audio, ElevenLabs, OpenAI Realtime).',
    ],
    keyPointsAr: [
      'التقاط الصوت عبر Web Audio API مع كشف التوقف والحديث (VAD) من طرف العميل.',
      'محولات صوتية قابلة للتبديل (Whisper وElevenLabs وGemini Audio).',
    ],
  },
  {
    number: 18,
    titleEn: 'Notification Architecture',
    titleAr: 'معمارية الإشعارات والتنبيهات',
    category: 'platform',
    summaryEn: 'Real-time multi-channel notification dispatcher for task approvals, streaming completions, system events, and errors.',
    summaryAr: 'نظام إشعارات متعدد القنوات لتنبيهات الموافقة على المهام وانتهاء التوليد وأحداث النظام.',
    keyPointsEn: [
      'In-app toasts, persistent notification drawer, and Web Push Notifications for long tasks.',
      'High-priority interruption cards for pending tool execution approvals.',
    ],
    keyPointsAr: [
      'إشعارات منبثقة، وقائمة إشعارات دائمة، وإشعارات دفع ويب (Web Push) للمهام الطويلة.',
      'بطاقات تنبيه ذات أولوية قصوى عندما تتوقف مهمة بانتظار موافقة المستخدم.',
    ],
  },
  {
    number: 19,
    titleEn: 'Permissions & Security Architecture',
    titleAr: 'معمارية الأمان والصلاحيات والتدقيق',
    category: 'data_security',
    summaryEn: 'Zero-trust security model enforcing explicit capability grants, key masking, cryptographic audit logs, and policy compliance.',
    summaryAr: 'نموذج أمان منعدم الثقة (Zero-Trust) يفرض منح الصلاحيات الصريحة، وتدقيق العمليات الحساسة.',
    keyPointsEn: [
      'No unrestricted permanent tool execution mode allowed under any circumstance.',
      'Tamper-evident audit logging for all key changes, tool executions, and data exports.',
      'Content Security Policy (CSP) and strict CORS proxying.',
    ],
    keyPointsAr: [
      'منع بات لأي وضع تنفيذ دائم غير مقيد تحت أي ظرف لحماية بيانات المستخدم.',
      'سجل تدقيق كامل ومؤرخ بدقة لكل عملية تغيير مفاتيح أو تشغيل أدوات أو تصدير بيانات.',
      'سياسات أمان محتوى صارمة (CSP) ووساطة آمنة للطلبات عبر الخادم.',
    ],
  },
  {
    number: 20,
    titleEn: 'Backup, Import & Export Architecture',
    titleAr: 'معمارية النسخ الاحتياطي والاستيراد والتصدير',
    category: 'data_security',
    summaryEn: 'Full platform portability with encrypted backup archives, standard JSON exports, and lossless migration without vendor capture.',
    summaryAr: 'قابلية نقل كاملة للمنصة مع نسخ احتياطية مشفرة، وتصدير بصيغة JSON المعيارية دون ارتهان.',
    keyPointsEn: [
      'Selective or full workspace export (Conversations, Projects, Assistants, Memory, Artifacts).',
      'Encrypted backup package support with user-specified passphrase.',
      'Standard OpenAI / Anthropic format export for maximum interoperability.',
    ],
    keyPointsAr: [
      'تصدير كلي أو انتقائي لمساحة العمل (المحادثات، المشاريع، المساعدين، الذاكرة، والمخرجات).',
      'دعم تشفير النسخ الاحتياطية بكلمة مرور خاصة يحددها المستخدم.',
      'تصدير بتنسيقات قياسية مفتوحة تتيح النقل لأي منصة أخرى مستقبلاً.',
    ],
  },
  {
    number: 21,
    titleEn: 'Web + Android Strategy',
    titleAr: 'استراتيجية الويب ونظام أندرويد',
    category: 'platform',
    summaryEn: 'Unified progressive responsive web application paired with Trusted Web Activity (TWA) or Capacitor Android wrapper ensuring 100% functional parity.',
    summaryAr: 'تطبيق ويب تقدمي (PWA) متجاوب بالكامل مقترن بـ TWA أو Capacitor لتطابق وظيفي تام على أندرويد.',
    keyPointsEn: [
      'PWA compliance with offline service worker, Web App Manifest, and home-screen install prompt.',
      'Touch-first responsive layouts with minimum 44px hit targets and native bottom sheets on mobile.',
      'Android hardware integration: Web Share API, Speech Recognition, and Biometric WebAuthn.',
    ],
    keyPointsAr: [
      'معايير PWA الكاملة مع دعم العمل دون اتصال وتثبيت فوري على شاشة أندرويد الرئيسية.',
      'واجهة مصممة للمس مع أهداف نقر لا تقل عن 44 بكسل وقوائم سفلية مريحة للهواتف.',
      'تكامل مع ميزات أندرويد: المشاركة الأصلية، والتعرف على الصوت، وقفل التطبيق بالبصمة.',
    ],
  },
  {
    number: 22,
    titleEn: 'GitHub & Project Structure',
    titleAr: 'هيكلية المشروع والمستودع البرمجي',
    category: 'platform',
    summaryEn: 'Scalable, clean monorepo or modular TypeScript workspace with strict separation of domain types, adapters, services, and UI components.',
    summaryAr: 'هيكلية معيارية ومنظمة تفصل بدقة بين النماذج الرياضية والمحولات والخدمات والواجهات.',
    keyPointsEn: [
      'Dedicated packages: /src/types (domain contracts), /src/services/providers (adapters), /src/services/orchestration, /src/components.',
      'Strict linting, automated TypeScript type checking, and zero circular dependencies.',
    ],
    keyPointsAr: [
      'مجلدات مفصولة ومحددة: src/types للتعريفات، src/services/providers للمحولات، src/components للواجهات.',
      'فحص نمطي وتدقيق صارم بالكود وانعدام الاعتماديات الدائرية تماماً.',
    ],
  },
  {
    number: 23,
    titleEn: 'Testing & Quality Strategy',
    titleAr: 'استراتيجية الاختبار وضمان الجودة',
    category: 'platform',
    summaryEn: 'Comprehensive quality assurance spanning unit tests for provider adapters, integration tests for SSE multiplexing, and UI end-to-end flows.',
    summaryAr: 'خطة جودة شاملة تشمل اختبارات الوحدة للمحولات واختبارات تكاملية لتدفقات البث والواجهة.',
    keyPointsEn: [
      'Mock adapter testing verifying conformance to IAIProviderAdapter interface for all providers.',
      'Bilingual RTL/LTR visual regression testing for zero layout clipping.',
      'Security audit test suites verifying tool approval gates cannot be bypassed.',
    ],
    keyPointsAr: [
      'اختبارات محاكاة للتحقق من التزام كل محول بواجهة IAIProviderAdapter المعيارية.',
      'اختبارات بصرية مستمرة للتأكد من سلامة الواجهة باللغتين العربية والإنجليزية.',
      'اختبارات أمان مؤتمتة تؤكد استحالة تخطي بوابات موافقة المستخدم عند تشغيل الأدوات.',
    ],
  },
  {
    number: 24,
    titleEn: 'Major Technical Risks & Mitigations',
    titleAr: 'المخاطر التقنية الكبرى وطرق تفاديها',
    category: 'core',
    summaryEn: 'Systematic analysis of provider rate limits, streaming desynchronization, token blowup, key security, and execution drift.',
    summaryAr: 'تحليل دقيق لمخاطر حدود الاستهلاك، وتزامن البث، واستهلاك الرموز، وأمان المفاتيح.',
    keyPointsEn: [
      'Risk: Multi-model simultaneous streaming causing browser thread starvation -> Mitigation: Web Worker stream decoding and throttled render batches.',
      'Risk: API key theft via XSS -> Mitigation: Server-side secure HTTP-only session keys and client Web Crypto encryption.',
      'Risk: Uncontrolled agent loops -> Mitigation: Hard execution step limits and mandatory approval checkpoints.',
    ],
    keyPointsAr: [
      'خطر: بطء الواجهة أثناء البث المتزامن لعدة نماذج -> الحل: فك ترميز البث داخل Web Workers ودفعات تحديث محسوبة.',
      'خطر: تسريب مفاتيح API عبر XSS -> الحل: تشفير المفاتيح عبر Web Crypto ونقلها عبر وسيط آمن.',
      'خطر: الحلقات اللانهائية للمهام -> الحل: سقف أقصى للخطوات وطلب موافقة يدوية إلزامية.',
    ],
  },
  {
    number: 25,
    titleEn: 'Recommended Implementation Phases',
    titleAr: 'مراحل التنفيذ الموصى بها',
    category: 'core',
    summaryEn: 'Structured phased roadmap prioritizing foundational correctness, provider abstraction, multi-model execution, and advanced workflows.',
    summaryAr: 'خارطة طريق مرحلية محكمة تركز على التأسيس الصحيح، تجريد المزودين، ثم التنفيذ المتقدم.',
    keyPointsEn: [
      'Phase 0 (Current): Architectural Proposal & Core Foundation setup (Contracts, Registry, Shell, Bilingual tokens).',
      'Phase 1: Multi-Provider Chat Engine (Gemini, OpenAI, Anthropic adapters, BYOK Accounts, Vertical multi-model layout, Context forwarding).',
      'Phase 2: Projects, Assistants & Persistent File/Artifact library.',
      'Phase 3: Independent Web Search, Scoped Memory, and MCP Tools with approval gates.',
      'Phase 4: Long-Running Multi-step Tasks, Voice Engine, and Full Backup/Portability.',
    ],
    keyPointsAr: [
      'المرحلة 0 (الحالية): المقترح المعماري والتأسيس الأولي (العقود، السجل، الهيكل، اللغات).',
      'المرحلة 1: محرك المحادثة متعدد المزودين (محولات Gemini وOpenAI وAnthropic، المفاتيح الخاصة، المقارنة الرأسية، توجيه السياق).',
      'المرحلة 2: المشاريع، المساعدين المتكاملين، ومكتبة الملفات والمخرجات.',
      'المرحلة 3: البحث المستقل، الذاكرة المنظمة، وأدوات MCP مع بوابات الموافقة الصارمة.',
      'المرحلة 4: المهام طويلة المدى، التفاعل الصوتي، والنسخ الاحتياطي الكامل.',
    ],
  },
];

export const ArchitectureViewer: React.FC = () => {
  const { locale } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedSection, setExpandedSection] = useState<number | null>(1);
  const [activeTab, setActiveTab] = useState<'blueprint' | 'providers' | 'separation' | 'contracts'>('blueprint');

  const categories = [
    { id: 'all', labelEn: 'All 25 Specifications', labelAr: 'جميع المواصفات (25)' },
    { id: 'core', labelEn: 'Core Architecture', labelAr: 'المعمارية الجوهرية' },
    { id: 'execution', labelEn: 'Execution & Models', labelAr: 'التنفيذ والنماذج' },
    { id: 'data_security', labelEn: 'Data & Security', labelAr: 'البيانات والأمان' },
    { id: 'platform', labelEn: 'Platform & Roadmap', labelAr: 'المنصة وخارطة الطريق' },
  ];

  const filteredSections = ARCHITECTURE_SECTIONS.filter(
    (sec) => selectedCategory === 'all' || sec.category === selectedCategory
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Overview Card */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-blue-50/40 p-6 shadow-xs dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/90 dark:to-blue-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{locale === 'en' ? 'Phase 0: Architectural Analysis & Foundation' : 'المرحلة 0: التحليل المعماري والتأسيس'}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {locale === 'en' ? 'AI Nexus Architecture & System Blueprint' : 'المخطط المعماري الشامل لمنصة AI Nexus'}
            </h1>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              {locale === 'en'
                ? 'Comprehensive technical blueprint addressing all 25 architecture domains for a professional, provider-agnostic platform supporting Web + Android, BYOK accounts, vertical multi-model comparison, and strict security guardrails.'
                : 'مخطط تقني شامل يغطي جميع النطاقات الـ 25 المعمارية لمنصة ذكاء اصطناعي محترفة ومستقلة تماماً عن المزودين تدعم الويب وأندرويد، مع مفاتيح المستخدم الخاصة، والمقارنة الرأسية، وأعلى معايير الأمان.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-800">
              <span className="block text-lg font-bold text-blue-600 dark:text-blue-400">25 / 25</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {locale === 'en' ? 'Modules Analyzed' : 'نطاقاً معمارياً موثقاً'}
              </span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-800">
              <span className="block text-lg font-bold text-emerald-600 dark:text-emerald-400">100%</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {locale === 'en' ? 'Provider Agnostic' : 'استقلالية المزودين'}
              </span>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-1.5 border-t border-slate-200/80 pt-4 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('blueprint')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'blueprint'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{locale === 'en' ? '25 Architecture Modules' : 'الوحدات المعمارية الـ 25'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('providers')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'providers'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>{locale === 'en' ? 'Provider Abstraction Layer' : 'طبقة تجريد المزودين'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contracts')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'contracts'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <FileCode2 className="h-3.5 w-3.5" />
            <span>{locale === 'en' ? 'TypeScript Type Contracts' : 'عقود TypeScript للواجهات'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('separation')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'separation'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <Check className="h-3.5 w-3.5" />
            <span>{locale === 'en' ? 'Audit & Scope Separation' : 'تقرير الفصل بين المراحل والتنفيذ'}</span>
          </button>
        </div>
      </div>

      {/* Tab Content: 25 Architecture Modules */}
      {activeTab === 'blueprint' && (
        <div className="space-y-4">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'
                }`}
              >
                {locale === 'en' ? cat.labelEn : cat.labelAr}
              </button>
            ))}
          </div>

          {/* List of 25 Modules */}
          <div className="grid grid-cols-1 gap-3">
            {filteredSections.map((sec) => {
              const isExpanded = expandedSection === sec.number;
              return (
                <div
                  key={sec.number}
                  className="rounded-xl border border-slate-200 bg-white transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedSection(isExpanded ? null : sec.number)}
                    className="flex w-full items-start justify-between p-4 text-start"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-600 dark:bg-blue-950/80 dark:text-blue-400">
                        {sec.number}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {locale === 'en' ? sec.titleEn : sec.titleAr}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {locale === 'en' ? sec.summaryEn : sec.summaryAr}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="hidden sm:inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400 uppercase tracking-wide">
                        {sec.category}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/80 dark:bg-slate-850/40">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                        {locale === 'en' ? 'Key Architectural Directives' : 'المحددات المعمارية الرئيسية'}
                      </h4>
                      <ul className="space-y-1.5">
                        {(locale === 'en' ? sec.keyPointsEn : sec.keyPointsAr).map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content: Provider Abstraction Layer */}
      {activeTab === 'providers' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900/60 dark:bg-blue-950/30">
            <div className="flex items-start gap-3">
              <Cpu className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200">
                  {locale === 'en'
                    ? 'Strict Provider Abstraction Principle'
                    : 'مبدأ تجريد المزودين الإلزامي'}
                </h3>
                <p className="mt-1 text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                  {locale === 'en'
                    ? 'AI Nexus treats Google Gemini, OpenAI, Anthropic, xAI, DeepSeek, Ollama, and OpenRouter as interchangeable execution adapters adhering to the IAIProviderAdapter interface. Gemini is provided as the out-of-the-box default model, but no internal subsystem or data structure is tied to Google or any specific AI vendor.'
                    : 'تتعامل AI Nexus مع Google Gemini وOpenAI وAnthropic وxAI وDeepSeek وOllama كمحولات تنفيذ متطابقة تتبع واجهة IAIProviderAdapter المعيارية. تم اعتماد Gemini كنموذج افتراضي أولي للمستخدم، ولكن دون أي ارتهان كودي أو هيكلي لأي شركة أو مزود.'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.values(PROVIDER_CATALOG).map((provider) => (
              <div
                key={provider.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {provider.name}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {provider.requiresApiKey ? 'BYOK' : 'Local / Free'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {provider.description}
                  </p>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-2 text-[10px] text-slate-400 dark:border-slate-800 flex items-center justify-between">
                  <span>{provider.authHeaderFormat.split(':')[0]}</span>
                  <span className="font-mono text-[9px] text-emerald-600 dark:text-emerald-400">Adapter Ready</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: TypeScript Type Contracts */}
      {activeTab === 'contracts' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-950 p-4 text-slate-200 font-mono text-xs overflow-x-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400">
              <span>src/services/providers/types.ts</span>
              <span className="text-emerald-400">Normalized Contract</span>
            </div>
            <pre className="mt-3 leading-relaxed">
{`export interface IAIProviderAdapter {
  readonly providerId: ProviderId;
  readonly providerName: string;
  readonly supportedCapabilities: ModelCapability[];

  validateCredentials(account: ProviderAccount, secretKey: string): Promise<{ valid: boolean; message?: string }>;
  listAvailableModels(account: ProviderAccount, secretKey: string): Promise<AIModel[]>;
  generateCompletion(request: CompletionRequest, account: ProviderAccount, secretKey: string): Promise<CompletionResult>;
  streamCompletion(
    request: CompletionRequest,
    account: ProviderAccount,
    secretKey: string,
    onChunk: (chunk: StreamChunk) => void,
    abortSignal?: AbortSignal
  ): Promise<CompletionResult>;
  estimateTokens(text: string, modelId: string): number;
}`}
            </pre>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              {locale === 'en' ? 'Core Subsystem Data Models' : 'نماذج بيانات الأنظمة الفرعية'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/60">
                <span className="font-semibold text-blue-600 dark:text-blue-400">Conversation & Stack</span>
                <p className="text-[11px] text-slate-500 mt-1">Multi-model vertical response arrays with context forwarding gates and per-response regeneration.</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/60">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">Projects & Assistants</span>
                <p className="text-[11px] text-slate-500 mt-1">Self-contained workspaces with persistent knowledge files, memory partitions, and custom instructions.</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/60">
                <span className="font-semibold text-amber-600 dark:text-amber-400">Tasks & Approval Gates</span>
                <p className="text-[11px] text-slate-500 mt-1">Multi-step DAG execution pipeline with strict approval steps; no unrestricted execution mode permitted.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Scope & Implementation Separation */}
      {activeTab === 'separation' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* What was Analyzed */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 dark:border-blue-900/60 dark:bg-blue-950/20">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <span>{locale === 'en' ? 'A. What Was Analyzed' : 'أ. ما تم تحليله بالكامل'}</span>
              </h3>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <li>• All 25 architecture domains rigorously specified and mapped.</li>
                <li>• Strict provider abstraction ensuring complete vendor independence.</li>
                <li>• Web + Android strategy with PWA installability and touch UX.</li>
                <li>• Security guardrail forbidding unrestricted permanent execution.</li>
                <li>• Bilingual English/Arabic design tokens and typography.</li>
              </ul>
            </div>

            {/* What Was Implemented */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>{locale === 'en' ? 'B. What Was Actually Implemented' : 'ب. ما تم تنفيذه فعلياً في هذا الطور'}</span>
              </h3>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <li>• Complete domain type definitions (`src/types/index.ts`).</li>
                <li>• Dynamic Provider Registry (`IAIProviderAdapter` & `ProviderRegistry`).</li>
                <li>• Provider and model catalogs with default Gemini and top models.</li>
                <li>• Responsive bilingual workspace shell (LTR/RTL, Dark/Light).</li>
                <li>• Simple Mode vs Advanced Mode UI state machine.</li>
                <li>• In-app Interactive 25-Specification Architecture Viewer.</li>
              </ul>
            </div>

            {/* What Remains Unimplemented */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                <span>{locale === 'en' ? 'C. What Remains Unimplemented' : 'ج. ما يتبقى للتنفيذ (المراحل القادمة)'}</span>
              </h3>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <li>• Active HTTP streaming calls to live provider API endpoints.</li>
                <li>• Multi-model simultaneous SSE broadcast pipeline.</li>
                <li>• Persistent file uploading and vector chunking engine.</li>
                <li>• MCP tool execution runner and live web search API bridge.</li>
                <li>• Native WebRTC/WebSocket audio streaming voice engine.</li>
              </ul>
            </div>

            {/* Recommended Next Phase */}
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/20">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
                <Workflow className="h-4 w-4" />
                <span>{locale === 'en' ? 'D. Recommended Next Phase (Phase 1)' : 'د. المرحلة الموصى بها كخطوة تالية (المرحلة 1)'}</span>
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {locale === 'en'
                  ? 'Implement Phase 1: The Multi-Provider Chat Engine. Wire up the Gemini, OpenAI, and Anthropic adapters with user-supplied keys, build the vertical multi-model response card stack, enable context forwarding controls, and provide one-click model response synthesis.'
                  : 'البدء بالمرحلة 1: بناء محرك المحادثة متعدد المزودين، تفعيل محولات Gemini وOpenAI وAnthropic بالمفاتيح التي يدخلها المستخدم، وبناء شبكة الردود الرأسية، وأزرار توجيه السياق وتوليف الإجابات.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
