import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArchitectureViewer } from '../foundation/ArchitectureViewer';
import { MessageSquare, Send, Plus, Bot, FolderGit2, Files, ListTodo, Cpu, Brain, Search, KeyRound, FileCheck2, Settings, AlertCircle, RefreshCw, Copy, GitCompare, RotateCcw } from 'lucide-react';
import { PROVIDER_CATALOG } from '../../services/providers/catalog';

const API = '/api';
const json = async (path: string, options?: RequestInit) => { const r = await fetch(`${API}${path}`, { headers: { 'content-type': 'application/json', ...(options?.headers || {}) }, ...options }); const b = await r.json().catch(() => ({})); if (!r.ok) throw new Error(b?.error || `Request failed (${r.status})`); return b; };
type ChatResponse = { id: string; ok?: boolean; modelId?: string; providerId?: string; content?: string; error?: string; latencyMs?: number };

export const SectionViewContainer: React.FC = () => {
  const { locale, activeSection, setActiveSection, models, selectedModelIds, toggleModelSelection, accounts, auditLogs, testAccount } = useApp();
  const [chatInput, setChatInput] = useState('');
  const [responses, setResponses] = useState<ChatResponse[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [contextForwardingEnabled, setContextForwardingEnabled] = useState(true);
  const [history, setHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [synthesisModel, setSynthesisModel] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => { if (!selectedAccountId && accounts[0]) setSelectedAccountId(accounts[0].id); }, [accounts, selectedAccountId]);
  const selectedModels = useMemo(() => models.filter((m) => selectedModelIds.includes(m.id)), [models, selectedModelIds]);

  const send = async () => {
    const text = chatInput.trim();
    if (!text || busy) return;
    if (!selectedAccountId) { setError(locale === 'en' ? 'Add and select a provider account first.' : 'أضف حساب مزود وحدده أولاً.'); setActiveSection('accounts'); return; }
    if (!selectedModels.length) { setError(locale === 'en' ? 'Select at least one discovered model.' : 'حدد نموذجًا واحدًا على الأقل.'); return; }
    setBusy(true); setError(''); setNotice('');
    const nextHistory = [...history, { role: 'user' as const, content: text }]; setHistory(nextHistory); setChatInput('');
    try {
      const body = await json('/chat/multi', { method: 'POST', body: JSON.stringify({ accountId: selectedAccountId, models: selectedModels.map((m) => m.id), messages: contextForwardingEnabled ? nextHistory : [{ role: 'user', content: text }] }) });
      setResponses(body.results || []);
      const successful = (body.results || []).filter((r: ChatResponse) => r.ok && r.content).map((r: ChatResponse) => r.content).join('\n\n');
      if (successful) setHistory((h) => [...h, { role: 'assistant', content: successful }]);
    } catch (e) { setError(e instanceof Error ? e.message : 'Request failed.'); }
    finally { setBusy(false); }
  };

  const retryOne = async (response: ChatResponse) => {
    if (!selectedAccountId || !response.modelId) return;
    setBusy(true); setError('');
    try { const body = await json('/chat', { method: 'POST', body: JSON.stringify({ accountId: selectedAccountId, model: response.modelId, messages: contextForwardingEnabled ? history : history.slice(-1) }) }); setResponses((all) => all.map((r) => r.modelId === response.modelId ? body : r)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Retry failed.'); }
    finally { setBusy(false); }
  };

  const synthesize = async () => {
    if (!selectedAccountId || !responses.length) return;
    const model = synthesisModel || selectedModels[0]?.id; if (!model) return;
    setBusy(true); setError('');
    try { const body = await json('/chat/synthesize', { method: 'POST', body: JSON.stringify({ accountId: selectedAccountId, model, messages: contextForwardingEnabled ? history : [], sourceResponses: responses.filter((r) => r.ok), instruction: 'Compare the independent answers, identify disagreements or uncertainty, then produce one precise answer. Do not invent missing facts.' }) }); setResponses((all) => [...all, body]); }
    catch (e) { setError(e instanceof Error ? e.message : 'Synthesis failed.'); }
    finally { setBusy(false); }
  };

  const copy = async (text?: string) => { if (text) { await navigator.clipboard?.writeText(text); setNotice(locale === 'en' ? 'Copied.' : 'تم النسخ.'); } };
  if (activeSection === 'overview') return <ArchitectureViewer />;

  if (activeSection === 'conversations') return (
    <div className="flex h-[calc(100vh-8.5rem)] flex-col gap-3">
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-2 border-b border-slate-100 pb-2.5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div className="flex items-center gap-2"><span className="text-xs font-bold text-slate-900 dark:text-white">{locale === 'en' ? 'Target models' : 'النماذج المستهدفة'}</span><span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">{selectedModelIds.length}</span></div>
          <div className="flex items-center gap-2"><span className="text-[11px] text-slate-500">{locale === 'en' ? 'Account' : 'الحساب'}</span><select value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] dark:border-slate-700 dark:bg-slate-800 dark:text-white"><option value="">{locale === 'en' ? 'Select' : 'اختر'}</option>{accounts.map((a) => <option key={a.id} value={a.id}>{a.accountLabel}</option>)}</select><button type="button" onClick={() => setContextForwardingEnabled((v) => !v)} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] dark:bg-slate-800 dark:text-slate-200">{contextForwardingEnabled ? 'Context ✓' : 'Turn only'}</button></div>
        </div>
        <div className="mt-2.5 flex max-h-20 flex-wrap gap-1.5 overflow-auto">{models.map((model) => { const selected = selectedModelIds.includes(model.id); return <button key={model.id} type="button" onClick={() => toggleModelSelection(model.id)} className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${selected ? 'border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-200' : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300'}`}><span className={`h-2 w-2 rounded-full ${selected ? 'bg-blue-600' : 'bg-slate-300'}`} />{model.name}</button>; })}</div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/60">
        {!responses.length && !history.length && <div className="flex h-full items-center justify-center text-center"><div><MessageSquare className="mx-auto h-8 w-8 text-blue-500"/><h2 className="mt-3 text-base font-bold text-slate-900 dark:text-white">{locale === 'en' ? 'AI Nexus Chat' : 'محادثة AI Nexus'}</h2><p className="mt-1 max-w-md text-xs text-slate-500">{locale === 'en' ? 'Send one message to multiple independently selected models, then compare or synthesize their answers.' : 'أرسل الرسالة إلى عدة نماذج مستقلة ثم قارن الإجابات أو ولّد إجابة مركبة.'}</p></div></div>}
        {history.filter((m) => m.role === 'user').map((m, i) => <div key={`u-${i}`} className="mb-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-800 dark:bg-slate-800/70 dark:text-slate-100"><div className="mb-1 text-[10px] font-bold uppercase text-slate-400">You</div>{m.content}</div>)}
        {responses.length > 0 && <div className="grid gap-3">{responses.map((r, i) => <article key={`${r.id || r.modelId}-${i}`} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between gap-2"><div><div className="text-xs font-bold text-slate-900 dark:text-white">{r.modelId || 'Model'}</div><div className="text-[10px] text-slate-400">{r.providerId || ''}{r.latencyMs ? ` · ${r.latencyMs}ms` : ''}</div></div><div className="flex gap-1"><button title="Copy" onClick={() => copy(r.content)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><Copy className="h-3.5 w-3.5"/></button><button title="Retry" onClick={() => retryOne(r)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><RotateCcw className="h-3.5 w-3.5"/></button></div></div>{r.ok === false ? <div className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-300">{r.error}</div> : <div className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-800 dark:text-slate-100">{r.content}</div>}</article>)}</div>}
      </div>
      {responses.length > 1 && <div className="flex flex-wrap items-center gap-2"><select value={synthesisModel} onChange={(e) => setSynthesisModel(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white">{selectedModels.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select><button disabled={busy} onClick={synthesize} className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"><GitCompare className="h-3.5 w-3.5"/>{locale === 'en' ? 'Compare & Synthesize' : 'مقارنة وتوليف'}</button></div>}
      {error && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-2 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-300"><AlertCircle className="h-4 w-4"/>{error}</div>}
      {notice && <div className="text-xs text-emerald-600">{notice}</div>}
      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-2 px-2 py-1"><button type="button" onClick={() => setChatInput('')} title="New turn" className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><Plus className="h-4 w-4"/></button><input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder={locale === 'en' ? `Message ${selectedModelIds.length || 0} model(s)...` : `إرسال إلى ${selectedModelIds.length || 0} نموذج...`} className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"/><button type="button" disabled={busy || !chatInput.trim()} onClick={send} className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs hover:bg-blue-700 disabled:opacity-50">{busy ? <RefreshCw className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}</button></div></div>
    </div>
  );

  if (activeSection === 'accounts') return <div className="space-y-6"><div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800"><div><h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white"><KeyRound className="h-4 w-4 text-blue-600"/>{locale === 'en' ? 'AI Provider Accounts & API Keys' : 'حسابات ومفاتيح مزودي الذكاء الاصطناعي'}</h2><p className="mt-1 text-xs text-slate-500">{locale === 'en' ? 'Credentials stay server-side and are never exposed to the browser.' : 'تبقى بيانات الاعتماد في الخادم ولا تُعرض للمتصفح.'}</p></div><button type="button" onClick={() => setActiveSection('settings')} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"><Plus className="h-3.5 w-3.5"/>Add Provider Account</button></div><div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">{Object.values(PROVIDER_CATALOG).map((provider) => { const account = accounts.find((a) => a.providerId === provider.id); return <div key={provider.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40"><div className="flex items-start justify-between"><div><h3 className="text-sm font-bold text-slate-900 dark:text-white">{provider.name}</h3><p className="mt-0.5 text-xs text-slate-500">{provider.description}</p></div><span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${account ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>{account ? 'Active' : 'Not Configured'}</span></div><div className="mt-4 flex items-center justify-between border-t border-slate-200/80 pt-3 text-xs dark:border-slate-700/80"><span className="font-mono text-[11px] text-slate-500">{account ? account.apiKeyMasked : 'No API key set'}</span>{account && <button type="button" onClick={async () => { const r = await testAccount(account.id); setNotice(r.ok ? `Connection OK — ${r.modelCount || 0} models discovered.` : r.error || 'Connection failed.'); }} className="flex items-center gap-1 text-xs font-semibold text-blue-600"><RefreshCw className="h-3 w-3"/>Test</button>}</div></div>; })}</div></div></div>;
  if (activeSection === 'audit') return <div className="space-y-4"><div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white"><FileCheck2 className="h-4 w-4 text-emerald-600"/>{locale === 'en' ? 'Audit Log' : 'سجل التدقيق'}</h2><div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">{auditLogs.map((log) => <div key={log.id} className="flex items-start justify-between gap-3 py-3 text-xs"><div><span className="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-blue-800">{log.action}</span><span className="ml-2 font-semibold text-slate-700 dark:text-slate-200">{log.targetEntity}</span><p className="mt-1 font-mono text-[11px] text-slate-500">{JSON.stringify(log.details)}</p></div><span className="font-mono text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span></div>)}</div></div></div>;

  const meta: Record<string, any> = { projects: [FolderGit2, 'Projects & Workspaces'], assistants: [Bot, 'Assistants Hub'], files: [Files, 'Persistent Files & Artifact Library'], tasks: [ListTodo, 'Long-Running Tasks & Workflows'], tools: [Cpu, 'Tools & Integrations'], memory: [Brain, 'Memory System'], search: [Search, 'Search & Sources'], settings: [Settings, 'Settings & Security'] };
  const [Icon, title] = meta[activeSection] || [Settings, 'AI Nexus'];
  return <div className="flex min-h-[60vh] items-center justify-center"><div className="max-w-lg text-center"><Icon className="mx-auto h-10 w-10 text-blue-500"/><h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{title}</h2><p className="mt-2 text-sm text-slate-500">{locale === 'en' ? 'This module is connected to the AI Nexus backend and is being implemented as a real feature.' : 'هذا المكوّن مرتبط بخادم AI Nexus ويتم استكماله كوظيفة حقيقية.'}</p></div></div>;
};
