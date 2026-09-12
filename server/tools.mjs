import crypto from 'node:crypto';
import { appendAudit, listEntities, upsertEntity, deleteEntity, getEntity } from './store.mjs';

const TOOL_TYPES = new Set(['mcp','api','webhook','custom']);
const PERMISSIONS = new Set(['read_only','confirm_each','persistent']);
const ACTIONS = new Set(['read','create','modify','delete','external_action']);

function clean(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function normalizePermission(value) {
  return PERMISSIONS.has(value) ? value : 'confirm_each';
}

export function publicTool(tool) {
  if (!tool) return null;
  return { ...tool };
}

export function listTools() {
  return listEntities('tools').map(publicTool);
}

export function registerTool(input = {}) {
  const name = clean(input.name);
  if (!name) throw new Error('Tool name is required');
  const type = TOOL_TYPES.has(input.type) ? input.type : 'custom';
  const permission = normalizePermission(input.permission);
  const actions = Array.isArray(input.actions) ? [...new Set(input.actions.filter((x) => ACTIONS.has(x)))] : ['read'];
  const now = new Date().toISOString();
  const existing = input.id ? getEntity('tools', input.id) : null;
  const tool = {
    id: existing?.id || input.id || crypto.randomUUID(),
    name,
    description: clean(input.description),
    type,
    endpoint: clean(input.endpoint),
    permission,
    actions,
    enabled: input.enabled !== false,
    config: input.config && typeof input.config === 'object' ? input.config : {},
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  upsertEntity('tools', tool);
  appendAudit({ action: existing ? 'tool.update' : 'tool.create', entityType: 'tool', entityId: tool.id, details: { name: tool.name, permission: tool.permission, actions: tool.actions } });
  return publicTool(tool);
}

export function removeTool(id) {
  const tool = getEntity('tools', id);
  if (!tool) throw new Error('Tool not found');
  deleteEntity('tools', id);
  appendAudit({ action: 'tool.delete', entityType: 'tool', entityId: id, details: { name: tool.name } });
  return { ok: true, id };
}

export function authorizeToolAction(toolId, action, { confirmed = false } = {}) {
  const tool = getEntity('tools', toolId);
  if (!tool) throw new Error('Tool not found');
  if (!tool.enabled) throw new Error('Tool is disabled');
  if (!ACTIONS.has(action)) throw new Error('Unsupported tool action');
  if (!tool.actions.includes(action)) throw new Error('Tool action is not permitted');
  if (tool.permission === 'read_only' && action !== 'read') throw new Error('Tool is read-only');
  if (tool.permission === 'confirm_each' && !confirmed) {
    return { allowed: false, requiresConfirmation: true, tool: publicTool(tool), action };
  }
  return { allowed: true, requiresConfirmation: false, tool: publicTool(tool), action };
}

export function executeToolAuthorization(toolId, action, options = {}) {
  const result = authorizeToolAction(toolId, action, options);
  if (!result.allowed) return result;
  appendAudit({ action: 'tool.authorize', entityType: 'tool', entityId: toolId, details: { requestedAction: action, permission: result.tool.permission, confirmed: options.confirmed === true } });
  return result;
}
