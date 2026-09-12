import React, { useEffect, useMemo, useState } from 'react';
import { Plus, MessageSquare, FolderKanban, Bot, Files, Settings, Send, Moon, Sun, Globe, KeyRound, Trash2, Copy, RefreshCw, GitCompare, Menu, X, Sparkles, ShieldCheck, Cpu } from 'lucide-react';

type Account = { id:string; providerId:string; label:string; apiKeyMasked:string; baseUrl?:string|null };
type Model = { id:string; name:string; providerId:string };
type ResponseItem = { id:string; modelId:string; providerId:string; content:string; latencyMs:number; error?:string };
type Message = { id:string; role:'user'|'assistant'; content:string; responses?:ResponseItem[] };

const PROVIDERS = [
  { id:'google_gemini', name:'Google Gemini', placeholder:'AIza...' },
  { id:'openai', name:'OpenAI', placeholder:'sk-...' },
  { id:'anthropic', name:'Anthropic', placeholder:'sk-ant-...' },
  { id:'openai_compatible', name:'OpenAI Compatible', placeholder:'API key' },
];

const STARTER_MODELS: Model[] = [
  { id:'gemini-3.1-pro-preview', name:'Gemini 3.1 Pro', providerId:'google_gemini' },
  { id:'gemini-3.6-flash', name:'Gemini 3.6 Flash', providerId:'google_gemini' },
  { id:'gpt-5', name:'GPT-5', providerId:'openai' },
  { id:'gpt-5-mini', name:'GPT-5 Mini', providerId:'openai' },
  { id:'claude-sonnet-4', name:'Claude Sonnet', providerId:'anthropic' },
];

const uid = () => crypto.randomUUID();

export default function App() {
  const [section,setSection] = useState('home');
  const [messages,setMessages] = useState<Message[]>([]);
  const [input,setInput] = useState('');
  const [accounts,setAccounts] = useState<Account[]>([]);
  const [models,setModels] = useState<Model[]>(STARTER_MODELS);
  const [selected,setSelected] = useState<string[]>(['gemini-3.6-flash']);
  const [busy,setBusy] = useState(false);
  const [dark,setDark] = useState(localStorage.getItem('ai-nexus-theme') !== 'light');
  const [lang,setLang] = useState<'ar'|'en'>((localStorage.getItem('ai-nexus-lang') as 'ar'|'en') || 'ar');
  const [showAccounts,setShowAccounts] = useState(false);
  const [showSidebar,setShowSidebar] = useState(false);
  const [compareMode,setCompareMode] = useState(false);

  const ar = lang === 'ar';
  useEffect(()=>{ document.documentElement.classList.toggle('dark',dark); document.documentElement.dir=ar?'rtl':'ltr'; localStorage.setItem('ai-nexus-theme',dark?'dark':'light'); localStorage.setItem('ai-nexus-lang',lang); },[dark,lang,ar]);
  useEffect(()=>{ fetch('/api/accounts').then(r=>r.ok?r.json():null).then(x=>x&&setAccounts(x.accounts||[])).catch(()=>{}); fetch('/api/models').then(r=>r.ok?r.json():null).then(x=>x?.models?.length&&setModels(x.models)).catch(()=>{}); },[]);

  const selectedModels = useMemo(()=>models.filter(m=>selected.includes(m.id)),[models,selected]);
  const accountFor = (model:Model) => accounts.find(a=>a.providerId===model.providerId);

  function newChat(){ setMessages([]); setInput(''); setSection('home'); }
  function toggleModel(id:string){ setSelected(s=>s.includes(id)?(s.length>1?s.filter(x=>x!==id):s):[...s,id]); }

  async function send(){
    const text=input.trim(); if(!text || busy) return;
    const user:Message={id:uid(),role:'user',content:text};
    setMessages(m=>[...m,user]); setInput(''); setBusy(true);
    const baseHistory=[...messages,user].map(m=>({role:m.role,content:m.content}));
    const results:ResponseItem[] = await Promise.all(selectedModels.map(async model=>{
      const account=accountFor(model);
      if(!account) return {id:uid(),modelId:model.id,providerId:model.providerId,content:'',latencyMs:0,error: ar?`لم يتم إعداد حساب ${model.providerId}. افتح الإعدادات وأضف مفتاح API.`:`No ${model.providerId} account is configured. Open Settings and add an API key.`};
      try{
        const r=await fetch('/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({accountId:account.id,model:model.id,messages:baseHistory,conversationId:messages.length?'current':uid()})});
        const data=await r.json(); if(!r.ok) throw new Error(data.error||'Request failed');
        return {id:uid(),modelId:model.id,providerId:model.providerId,content:data.content||'',latencyMs:data.latencyMs||0};
      }catch(e){ return {id:uid(),modelId:model.id,providerId:model.providerId,content:'',latencyMs:0,error:e instanceof Error?e.message:'Request failed'}; }
    }));
    setMessages(m=>[...m,{id:uid(),role:'assistant',content:'',responses:results}]); setBusy(false);
  }

  const nav=[['home',MessageSquare,ar?'المحادثات':'Conversations'],['projects',FolderKanban,ar?'المشاريع':'Projects'],['assistants',Bot,ar?'المساعدون':'Assistants'],['files',Files,ar?'الملفات':'Files'],['settings',Settings,ar?'الإعدادات':'Settings']];

  return <div className="app-shell">
    <aside className={`sidebar ${showSidebar?'open':''}`}>
      <div className="brand"><div className="brand-mark"><Sparkles size={18}/></div><div><strong>AI Nexus</strong><small>{ar?'مركز الذكاء الاصطناعي':'AI command center'}</small></div><button className="mobile-close" onClick={()=>setShowSidebar(false)}><X size={18}/></button></div>
      <button className="new-chat" onClick={newChat}><Plus size={17}/>{ar?'محادثة جديدة':'New chat'}</button>
      <nav>{nav.map(([id,Icon,label])=><button key={id as string} className={section===id?'active':''} onClick={()=>{setSection(id as string);setShowSidebar(false)}}><Icon size={17}/><span>{label as string}</span></button>)}</nav>
      <div className="sidebar-foot"><div className="secure"><ShieldCheck size={15}/><span>{ar?'مفاتيحك تبقى على الخادم المشفر':'Your keys stay server-side'}</span></div><button onClick={()=>setShowAccounts(true)}><KeyRound size={16}/>{ar?'الحسابات والمفاتيح':'Accounts & keys'}</button></div>
    </aside>
    {showSidebar&&<div className="scrim" onClick={()=>setShowSidebar(false)}/>} 
    <main className="main">
      <header><button className="menu" onClick={()=>setShowSidebar(true)}><Menu size={20}/></button><div className="header-title"><Cpu size={16}/><span>{section==='home'?(ar?'محادثة':'Conversation'):(nav.find(x=>x[0]===section)?.[2] as string)}</span></div><div className="header-actions"><button onClick={()=>setLang(ar?'en':'ar')} title="Language"><Globe size={17}/></button><button onClick={()=>setDark(!dark)} title="Theme">{dark?<Sun size={17}/>:<Moon size={17}/>}</button></div></header>
      {section==='home' ? <>
        <div className="model-strip"><div className="model-label">{ar?'النماذج':'Models'}</div>{models.map(m=><button key={m.id} className={selected.includes(m.id)?'model-chip selected':'model-chip'} onClick={()=>toggleModel(m.id)}><span className="dot"/>{m.name}</button>)}<button className="compare" onClick={()=>setCompareMode(!compareMode)}><GitCompare size={14}/>{ar?'مقارنة':'Compare'}</button></div>
        <section className="chat-area">
          {messages.length===0 ? <div className="welcome"><div className="welcome-icon"><Sparkles size={26}/></div><h1>{ar?'ماذا تريد أن تنجز اليوم؟':'What do you want to accomplish today?'}</h1><p>{ar?'اختر نموذجًا أو عدة نماذج، ثم اكتب طلبك. AI Nexus يرسل نفس السياق لكل نموذج بشكل مستقل.':'Choose one or multiple models. The same context is sent independently to each selected model.'}</p><div className="quick-grid"><button onClick={()=>setInput(ar?'حلّل هذا الموضوع بعمق واذكر الافتراضات والمخاطر.':'Analyze this topic deeply and state assumptions and risks.')}>{ar?'تحليل عميق':'Deep analysis'}</button><button onClick={()=>setInput(ar?'قارن بين عدة حلول وأعطني المفاضلات.':'Compare multiple solutions and explain the trade-offs.')}>{ar?'مقارنة حلول':'Compare solutions'}</button><button onClick={()=>setInput(ar?'حوّل هذه الفكرة إلى خطة تنفيذ عملية.':'Turn this idea into a practical execution plan.')}>{ar?'خطة تنفيذ':'Execution plan'}</button></div></div> : <div className="messages">{messages.map(m=>m.role==='user'?<div className="user-message" key={m.id}><div>{m.content}</div></div>:<div className="response-grid" key={m.id}>{m.responses?.map(r=><ResponseCard key={r.id} item={r} model={models.find(x=>x.id===r.modelId)} onRetry={()=>{setInput(messages[messages.length-2]?.content||'');}} />)}</div>)}</div>}
        </section>
        <div className="composer-wrap"><div className="composer"><textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}} placeholder={ar?'اكتب رسالتك هنا...':'Message AI Nexus...'} rows={1}/><div className="composer-bottom"><span>{selectedModels.length} {ar?'نماذج محددة':'model(s) selected'}</span><button className="send" onClick={send} disabled={busy||!input.trim()}>{busy?<RefreshCw className="spin" size={17}/>:<Send size={17}/>}</button></div></div></div>
      </> : <SectionPlaceholder section={section} ar={ar} onAccounts={()=>setShowAccounts(true)} />}
    </main>
    {showAccounts&&<AccountDialog ar={ar} accounts={accounts} setAccounts={setAccounts} onClose={()=>setShowAccounts(false)}/>} 
  </div>
}

function ResponseCard({item,model,onRetry}:{item:ResponseItem;model?:Model;onRetry:()=>void}){ const [copied,setCopied]=useState(false); return <article className="response-card"><div className="response-head"><div><span className="model-name">{model?.name||item.modelId}</span><span className="provider-name">{item.providerId}</span></div><span className="latency">{item.latencyMs?`${item.latencyMs}ms`:''}</span></div>{item.error?<div className="error-box">{item.error}</div>:<div className="response-body">{item.content}</div>}<div className="response-actions"><button onClick={()=>{navigator.clipboard?.writeText(item.content);setCopied(true);setTimeout(()=>setCopied(false),1200)}}><Copy size={14}/>{copied?'Copied':''}</button><button onClick={onRetry}><RefreshCw size={14}/></button></div></article> }

function SectionPlaceholder({section,ar,onAccounts}:{section:string;ar:boolean;onAccounts:()=>void}){const data:any={projects:[FolderKanban,ar?'المشاريع':'Projects',ar?'مساحات عمل مستقلة للمحادثات والملفات والمساعدين والذاكرة.':'Independent workspaces for conversations, files, assistants and memory.'],assistants:[Bot,ar?'المساعدون':'Assistants',ar?'أنشئ مساعدين متخصصين بإعدادات ونماذج ومعرفة وأدوات خاصة.':'Create specialized assistants with their own models, knowledge and tools.'],files:[Files,ar?'الملفات':'Files',ar?'مكتبة ملفات موحدة لإعادة الاستخدام عبر المحادثات والمشاريع.':'A shared file library reusable across chats and projects.'],settings:[Settings,ar?'الإعدادات':'Settings',ar?'تحكم في اللغة والمظهر والمزودين والخصوصية والتكاملات.':'Control language, appearance, providers, privacy and integrations.']}[section];const Icon=data[0];return <div className="placeholder"><div className="placeholder-icon"><Icon size={27}/></div><h2>{data[1]}</h2><p>{data[2]}</p>{section==='settings'&&<button className="primary" onClick={onAccounts}><KeyRound size={15}/>{ar?'إدارة حسابات الذكاء الاصطناعي':'Manage AI accounts'}</button>}<span className="coming">{ar?'يتم بناء هذه الوحدة ضمن طبقات النظام الأساسية.':'This module is being built on the core platform layer.'}</span></div>}

function AccountDialog({ar,accounts,setAccounts,onClose}:{ar:boolean;accounts:Account[];setAccounts:React.Dispatch<React.SetStateAction<Account[]>>;onClose:()=>void}){const [providerId,setProvider]=useState('google_gemini');const [label,setLabel]=useState('');const [apiKey,setKey]=useState('');const [baseUrl,setBase]=useState('');const [saving,setSaving]=useState(false);const [error,setError]=useState('');async function save(){setSaving(true);setError('');try{const r=await fetch('/api/accounts',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({providerId,label:label||PROVIDERS.find(p=>p.id===providerId)?.name,apiKey,baseUrl:baseUrl||null})});const d=await r.json();if(!r.ok)throw new Error(d.error);setAccounts(a=>[...a.filter(x=>x.id!==d.account.id),d.account]);setKey('');setLabel('');}catch(e){setError(e instanceof Error?e.message:'Failed')}finally{setSaving(false)}}async function remove(id:string){await fetch(`/api/accounts/${id}`,{method:'DELETE'});setAccounts(a=>a.filter(x=>x.id!==id))}return <div className="modal-backdrop"><div className="modal"><div className="modal-head"><div><h2>{ar?'حسابات مزودي الذكاء الاصطناعي':'AI provider accounts'}</h2><p>{ar?'المفاتيح لا تُرسل للواجهة بعد الحفظ.':'Keys are never returned to the browser after saving.'}</p></div><button onClick={onClose}><X/></button></div><div className="accounts-list">{accounts.map(a=><div className="account-row" key={a.id}><div><strong>{a.label}</strong><small>{a.providerId} · {a.apiKeyMasked}</small></div><button onClick={()=>remove(a.id)}><Trash2 size={15}/></button></div>)}{accounts.length===0&&<div className="empty-account">{ar?'لا توجد حسابات مهيأة بعد.':'No provider accounts configured yet.'}</div>}</div><div className="account-form"><select value={providerId} onChange={e=>setProvider(e.target.value)}>{PROVIDERS.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select><input value={label} onChange={e=>setLabel(e.target.value)} placeholder={ar?'اسم الحساب':'Account label'}/>{providerId==='openai_compatible'&&<input value={baseUrl} onChange={e=>setBase(e.target.value)} placeholder="https://provider.example/v1"/>}<input type="password" value={apiKey} onChange={e=>setKey(e.target.value)} placeholder={PROVIDERS.find(p=>p.id===providerId)?.placeholder}/>{error&&<div className="error-box">{error}</div>}<button className="primary" disabled={!apiKey||saving} onClick={save}>{saving?(ar?'حفظ...':'Saving...'):(ar?'حفظ الحساب':'Save account')}</button></div></div></div>}
