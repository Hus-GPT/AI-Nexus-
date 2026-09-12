import { randomUUID } from 'node:crypto';
import { getEntity, listEntities, upsertEntity, deleteEntity, appendAudit } from './store.mjs';

const SCOPES = new Set(['user', 'conversation', 'project', 'assistant']);
const MAX_CONTENT = 12000;
const MAX_RESULTS = 50;

function clean(value, fallback = '') {
  return String(value ?? fallback).trim();
}

function validate(input, { partial = false } = {}) {
  const item = { ...input };
  if (!partial || item.scope !== undefined) {
    if (!SCOPES.has(item.scope)) throw new Error('scope must be user, conversation, project, or assistant.');
  }
  if (!partial || item.content !== undefined) {
    item.content = clean(item.content);
    if (!item.content) throw new Error('content is required.');
    if (item.content.length > MAX_CONTENT) throw new Error(`content exceeds ${MAX_CONTENT} characters.`);
  }
  if (item.source !== undefined) item.source = clean(item.source) || 'manual';
  if (item.scopeId !== undefined) item.scopeId = clean(item.scopeId) || null;
  if (item.enabled !== undefined) item.enabled = Boolean(item.enabled);
  if (item.auto !== undefined) item.auto = Boolean(item.auto);
  if (item.tags !== undefined) item.tags = Array.isArray(item.tags) ? item.tags.map((x) => clean(x)).filter(Boolean).slice(0, 20) : [];
  if (item.relevance !== undefined) {
    const n = Number(item.relevance);
    item.relevance = Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0.5;
  }
  return item;
}

export async function createMemory(input) {
  const item = validate({ ...input, id: input?.id || randomUUID() });
  const memory = await upsertEntity('memories', {
    ...item,
    source: item.source || 'manual',
    auto: item.auto ?? false,
    enabled: item.enabled ?? true,
    relevance: item.relevance ?? 0.5,
    tags: item.tags || [],
  });
  await appendAudit('memory_created', memory.id, { scope: memory.scope, scopeId: memory.scopeId || null }, 'info');
  return memory;
}

export async function updateMemory(id, input) {
  const current = await getEntity('memories', id);
  if (!current) return null;
  const next = validate({ ...input, id }, { partial: true });
  const memory = await upsertEntity('memories', { ...current, ...next, id });
  await appendAudit('memory_updated', id, { scope: memory.scope }, 'info');
  return memory;
}

export async function removeMemory(id) {
  const current = await getEntity('memories', id);
  if (!current) return false;
  const removed = await deleteEntity('memories', id);
  if (removed) await appendAudit('memory_deleted', id, { scope: current.scope }, 'warning');
  return removed;
}

export async function setMemoryEnabled(id, enabled) {
  return updateMemory(id, { enabled: Boolean(enabled) });
}

export async function searchMemories({ query = '', scope, scopeId, includeDisabled = false, limit = 20 } = {}) {
  if (scope && !SCOPES.has(scope)) throw new Error('Invalid memory scope.');
  const q = clean(query).toLowerCase();
  const max = Math.max(1, Math.min(MAX_RESULTS, Number(limit) || 20));
  const all = await listEntities('memories');
  const filtered = all.filter((m) => {
    if (!includeDisabled && m.enabled === false) return false;
    if (scope && m.scope !== scope) return false;
    if (scopeId && m.scopeId !== scopeId) return false;
    if (!q) return true;
    const haystack = [m.content, m.source, ...(m.tags || [])].join(' ').toLowerCase();
    return q.split(/\s+/).filter(Boolean).every((term) => haystack.includes(term));
  });
  return filtered
    .map((m) => {
      const text = `${m.content} ${(m.tags || []).join(' ')}`.toLowerCase();
      const terms = q ? q.split(/\s+/).filter(Boolean) : [];
      const hits = terms.reduce((n, term) => n + (text.includes(term) ? 1 : 0), 0);
      return { ...m, matchScore: terms.length ? hits / terms.length : Number(m.relevance ?? 0.5) };
    })
    .sort((a, b) => (b.matchScore - a.matchScore) || String(b.updatedAt).localeCompare(String(a.updatedAt)))
    .slice(0, max);
}

export async function getMemory(id) {
  return getEntity('memories', id);
}

export { SCOPES, MAX_CONTENT, MAX_RESULTS };
