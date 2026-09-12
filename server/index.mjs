import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import {
  listAccounts, getAccount, saveAccount, deleteAccount,
  appendConversation, listConversations,
  listEntities, getEntity, upsertEntity, deleteEntity, appendAudit, listAudit,
} from './store.mjs';
import { catalogModels, complete, listModels, testConnection } from './providers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3001);
app.use(express.json({ limit: '25mb' }));

const asyncRoute = (handler) => (req, res) => Promise.resolve(handler(req, res)).catch((error) => res.status(500).json({ error: error.message || 'Internal server error.' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'ai-nexus', version: '0.3.0', time: new Date().toISOString() }));
app.get('/api/models', (_req, res) => res.json({ models: catalogModels() }));

app.get('/api/accounts', asyncRoute(async (_req, res) => res.json({ accounts: await listAccounts() })));
app.post('/api/accounts', asyncRoute(async (req, res) => res.status(201).json({ account: await saveAccount(req.body) })));
app.delete('/api/accounts/:id', asyncRoute(async (req, res) => res.json({ deleted: await deleteAccount(req.params.id) })));
app.post('/api/accounts/:id/test', asyncRoute(async (req, res) => {
  const account = await getAccount(req.params.id);
  if (!account) return res.status(404).json({ error: 'Account not found.' });
  const result = await testConnection({ providerId: account.providerId, apiKey: account.secret, baseUrl: account.baseUrl });
  await appendAudit('provider_connection_tested', account.id, { modelCount: result.modelCount }, 'info');
  return res.json(result);
}));
app.get('/api/accounts/:id/models', asyncRoute(async (req, res) => {
  const account = await getAccount(req.params.id);
  if (!account) return res.status(404).json({ error: 'Account not found.' });
  return res.json({ models: await listModels({ providerId: account.providerId, apiKey: account.secret, baseUrl: account.baseUrl }) });
}));

app.get('/api/conversations', asyncRoute(async (_req, res) => res.json({ conversations: await listConversations() })));
app.get('/api/conversations/:id', asyncRoute(async (req, res) => {
  const conversation = await getEntity('conversations', req.params.id);
  if (!conversation) return res.status(404).json({ error: 'Conversation not found.' });
  return res.json({ conversation });
}));
app.put('/api/conversations/:id', asyncRoute(async (req, res) => res.json({ conversation: await upsertEntity('conversations', { ...req.body, id: req.params.id }) })));
app.delete('/api/conversations/:id', asyncRoute(async (req, res) => res.json({ deleted: await deleteEntity('conversations', req.params.id) })));

const entityCollections = ['projects', 'assistants', 'memories', 'files', 'artifacts', 'tasks', 'notifications'];
for (const collection of entityCollections) {
  const singular = collection.endsWith('ies') ? `${collection.slice(0, -3)}y` : collection.slice(0, -1);
  const route = `/api/${collection}`;
  app.get(route, asyncRoute(async (_req, res) => res.json({ [collection]: await listEntities(collection) })));
  app.get(`${route}/:id`, asyncRoute(async (req, res) => {
    const entity = await getEntity(collection, req.params.id);
    if (!entity) return res.status(404).json({ error: `${singular} not found.` });
    return res.json({ [singular]: entity });
  }));
  app.post(route, asyncRoute(async (req, res) => {
    const entity = await upsertEntity(collection, req.body);
    await appendAudit(`${singular}_created`, entity.id, {}, 'info');
    return res.status(201).json({ [singular]: entity });
  }));
  app.put(`${route}/:id`, asyncRoute(async (req, res) => {
    const entity = await upsertEntity(collection, { ...req.body, id: req.params.id });
    await appendAudit(`${singular}_updated`, entity.id, {}, 'info');
    return res.json({ [singular]: entity });
  }));
  app.delete(`${route}/:id`, asyncRoute(async (req, res) => {
    const deleted = await deleteEntity(collection, req.params.id);
    if (deleted) await appendAudit(`${singular}_deleted`, req.params.id, {}, 'warning');
    return res.json({ deleted });
  }));
}

app.get('/api/audit', asyncRoute(async (_req, res) => res.json({ audit: await listAudit() })));

app.post('/api/chat', asyncRoute(async (req, res) => {
  const { accountId, model, messages, temperature, maxTokens, conversationId } = req.body || {};
  if (!accountId || !model || !Array.isArray(messages) || messages.length === 0) return res.status(400).json({ error: 'accountId, model and messages are required.' });
  const account = await getAccount(accountId);
  if (!account) return res.status(404).json({ error: 'Account not found.' });
  const result = await complete({ providerId: account.providerId, model, apiKey: account.secret, baseUrl: account.baseUrl, messages, options: { temperature, maxTokens } });
  const response = { id: randomUUID(), ...result, createdAt: new Date().toISOString() };
  if (conversationId) {
    const existing = await getEntity('conversations', conversationId);
    await appendConversation({ ...(existing || { id: conversationId, title: 'New conversation', isPinned: false, isArchived: false, createdAt: new Date().toISOString() }), messages, lastResponse: response, updatedAt: new Date().toISOString() });
  }
  return res.json(response);
}));

const dist = path.resolve(__dirname, '../dist');
app.use(express.static(dist));
app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
app.listen(port, '0.0.0.0', () => console.log(`AI Nexus server listening on ${port}`));
