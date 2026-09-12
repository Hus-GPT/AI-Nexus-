import { randomUUID } from 'node:crypto';
import { getEntity, listEntities, upsertEntity, deleteEntity, appendAudit } from './store.mjs';

const STATES = new Set(['queued', 'running', 'waiting_approval', 'completed', 'failed', 'cancelled']);
const TERMINAL = new Set(['completed', 'failed', 'cancelled']);
const MAX_STEPS = 100;

function now() { return new Date().toISOString(); }
function clean(value) { return String(value ?? '').trim(); }
function assertState(state) { if (!STATES.has(state)) throw new Error(`Invalid task state: ${state}`); }

async function notify({ title, message, severity = 'info', taskId, type = 'task' }) {
  const notification = await upsertEntity('notifications', {
    id: randomUUID(), title: clean(title) || 'AI Nexus task update', message: clean(message), severity, taskId: taskId || null,
    type, read: false, createdAt: now(),
  });
  return notification;
}

export async function createTask(input = {}) {
  const task = await upsertEntity('tasks', {
    id: input.id || randomUUID(),
    title: clean(input.title) || 'Untitled task',
    description: clean(input.description),
    state: 'queued',
    progress: 0,
    steps: Array.isArray(input.steps) ? input.steps.slice(0, MAX_STEPS) : [],
    results: [],
    approvals: [],
    metadata: input.metadata || {},
    createdAt: now(),
    startedAt: null,
    completedAt: null,
    error: null,
  });
  await appendAudit('task_created', task.id, { title: task.title }, 'info');
  await notify({ title: 'Task queued', message: task.title, taskId: task.id });
  return task;
}

export async function getTask(id) { return getEntity('tasks', id); }
export async function listTasks() { return listEntities('tasks'); }

export async function transitionTask(id, state, details = {}) {
  assertState(state);
  const task = await getTask(id);
  if (!task) return null;
  if (TERMINAL.has(task.state)) throw new Error(`Task is already ${task.state}.`);
  if (state === 'completed' && Number(details.progress ?? task.progress) < 1) details.progress = 1;
  const next = { ...task, ...details, id, state };
  if (state === 'running' && !task.startedAt) next.startedAt = now();
  if (TERMINAL.has(state)) next.completedAt = now();
  next.updatedAt = now();
  const saved = await upsertEntity('tasks', next);
  const severity = state === 'failed' ? 'error' : state === 'cancelled' ? 'warning' : 'info';
  await appendAudit('task_state_changed', id, { from: task.state, to: state }, severity);
  await notify({ title: `Task ${state}`, message: saved.title, severity, taskId: id });
  return saved;
}

export async function appendTaskStep(id, step) {
  const task = await getTask(id);
  if (!task) return null;
  if (TERMINAL.has(task.state)) throw new Error('Cannot append a step to a terminal task.');
  if ((task.steps || []).length >= MAX_STEPS) throw new Error(`A task cannot contain more than ${MAX_STEPS} steps.`);
  const item = { id: step?.id || randomUUID(), name: clean(step?.name) || `Step ${(task.steps || []).length + 1}`, state: step?.state || 'queued', progress: Math.max(0, Math.min(1, Number(step?.progress ?? 0))), result: step?.result ?? null, error: step?.error ?? null, createdAt: now(), updatedAt: now() };
  const saved = await upsertEntity('tasks', { ...task, steps: [...(task.steps || []), item], updatedAt: now() });
  return saved;
}

export async function requestApproval(id, input = {}) {
  const task = await getTask(id);
  if (!task) return null;
  if (TERMINAL.has(task.state)) throw new Error('Cannot request approval for a terminal task.');
  const approval = { id: randomUUID(), action: clean(input.action) || 'External action', reason: clean(input.reason), permissions: Array.isArray(input.permissions) ? input.permissions : [], status: 'pending', requestedAt: now(), decidedAt: null };
  const saved = await upsertEntity('tasks', { ...task, state: 'waiting_approval', approvals: [...(task.approvals || []), approval], updatedAt: now() });
  await appendAudit('approval_requested', id, { approvalId: approval.id, action: approval.action }, 'warning');
  await notify({ title: 'Approval required', message: approval.action, severity: 'warning', taskId: id, type: 'approval' });
  return { task: saved, approval };
}

export async function decideApproval(taskId, approvalId, approved, note = '') {
  const task = await getTask(taskId);
  if (!task) return null;
  const approvals = (task.approvals || []).map((a) => a.id === approvalId ? { ...a, status: approved ? 'approved' : 'rejected', note: clean(note), decidedAt: now() } : a);
  const approval = approvals.find((a) => a.id === approvalId);
  if (!approval) throw new Error('Approval not found.');
  const nextState = approved ? 'queued' : 'cancelled';
  const saved = await upsertEntity('tasks', { ...task, approvals, state: nextState, updatedAt: now(), completedAt: approved ? null : now() });
  await appendAudit(approved ? 'approval_approved' : 'approval_rejected', taskId, { approvalId }, approved ? 'info' : 'warning');
  await notify({ title: approved ? 'Approval granted' : 'Approval rejected', message: task.title, severity: approved ? 'info' : 'warning', taskId, type: 'approval' });
  return saved;
}

export async function addTaskResult(id, result) {
  const task = await getTask(id);
  if (!task) return null;
  if (TERMINAL.has(task.state)) throw new Error('Cannot add a result to a terminal task.');
  return upsertEntity('tasks', { ...task, results: [...(task.results || []), { id: randomUUID(), ...result, createdAt: now() }], updatedAt: now() });
}

export async function cancelTask(id) { return transitionTask(id, 'cancelled'); }

export async function deleteTask(id) {
  const task = await getTask(id);
  if (!task) return false;
  if (!TERMINAL.has(task.state)) throw new Error('Only completed, failed, or cancelled tasks can be deleted.');
  const deleted = await deleteEntity('tasks', id);
  if (deleted) await appendAudit('task_deleted', id, {}, 'warning');
  return deleted;
}

export async function markNotificationRead(id, read = true) {
  const n = await getEntity('notifications', id);
  if (!n) return null;
  return upsertEntity('notifications', { ...n, read: Boolean(read), updatedAt: now() });
}
