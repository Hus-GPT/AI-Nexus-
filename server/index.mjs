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
import { catalogModels, complete, completeMany, listModels, testConnection } from './providers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3001);
app.use(express.json({ limit: '25mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'ai-nexus', version: '0.3.0', time: new Date().toISOString() }));
app.get('/api/models', (_req, res) => res.json({ models: catalogModels() }));

app.get('/api/accounts', async (_req, res) => res.json({ accounts: await listAccounts() }));
app.post('/api/accounts', async (req, res) => {
  try { return res.status(201).json({ account: await saveAccount(req.body) }); }
  catch (error) { return res.status(400).json({ error: error.message }); }
});
app.delete('/api/accounts/:id', async (req, res) => res.json({ deleted: await deleteAccount(req.params.id) }));

app.get('/api/accounts/:id/models', async (req, res) => {
  try {
    const account = await getAccount(req.params.id);
    if (!account) return res.status(404).json({ error: 'Account not found.' });
    const models = await listModels({ providerId: account.providerId, apiKey: account.secret, baseUrl: account.baseUrl });
    return res.json({ models });
  } catch (error) { return res.status(502).json({ error: error.message }); }
});

app.post('/api/accounts/:id/test', async (req, res) => {
  try {
    const account = await getAccount(req.params.id);
    if (!account) return res.status(404).json({ error: 'Account not found.' });
    const result = await testConnection({ providerId: account.providerId, apiKey: account.secret, baseUrl: account.baseUrl });
    return res.json(result);
  } catch (error) { return res.status(502).json({ ok: false, error: error.message }); }
});

app.get('/api/conversations', async (_req, res) => res.json({ conversations: await listConversations() }));
app.get('/api/conversations/:id', async (req, res) => {
  const conversation = await getEntity('conversations', req.params.id);
  if (!conversation) return res.status(404).json({ error: 'Conversation not found.' });
  return res.json({ conversation });
});
app.put('/api/conversations/:id', async (req, res) => res.json({ conversation: await upsertEntity('conversations', { ...req.body, id: req.params.id }) }));
app.delete('/api/conversations/:id', async (req, res) => res.json({ deleted: await deleteEntity('conversations', req.params.id) }));

const entityCollections = ['projects', 'assistants', 'memories', 'files', 'artifacts', 'tasks', 'notifications'];
for (const collection of entityCollections) {
  const route = `/api/${collection}`;
  app.get(route, async (_req, res) => res.json({ [collection]: await listEntities(collection) }));
  app.get(`${route}/:id`, async (req, res) => {
    const entity = await getEntity(collection, req.params.id);
    if (!entity) return res.status(404).json({ error: `${collection.slice(0, -1)} not found.` });
    return res.json({ [collection.slice(0, -1)]: entity });
  });
  app.post(route, async (req, res) => {
    try {
      const entity = await upsertEntity(collection, req.body);
      await appendAudit(`${collection.slice(0, -1)}_created`, entity.id, {}, 'info');
      return res.status(201).json({ [collection.slice(0, -1)]: entity });
    } catch (error) { return res.status(400).json({ error: error.message }); }
  });
  app.put(`${route}/:id`, async (req, res) => {
    try {
      const entity = await upsertEntity(collection, { ...req.body, id: req.params.id });
      await appendAudit(`${collection.slice(0, -1)}_updated`, entity.id, {}, 'info');
      return res.json({ [collection.slice(0, -1)]: entity });
    } catch (error) { return res.status(400).json({ error: error.message }); }
  });
  app.delete(`${route}/:id`, async (req, res) => {
    const deleted = await deleteEntity(collection, req.params.id);
    if (deleted) await appendAudit(`${collection.slice(0, -1)}_deleted`, req.params.id, {}, 'warning');
    return res.json({ deleted });
  });
}

app.get('/api/audit', async (_req, res) => res.json({ audit: await listAudit() }));

function buildChatRequests({ account, models, messages, temperature, maxTokens }) {
  return models.map((model) => ({ providerId: account.providerId, model, apiKey: account.secret, baseUrl: account.baseUrl, messages, options: { temperature, maxTokens } }));
}

app.post('/api/chat', async (req, res) => {
  const { accountId, model, messages, temperature, maxTokens, conversationId } = req.body || {};
  if (!accountId || !model || !Array.isArray(messages) || messages.length === 0) return res.status(400).json({ error: 'accountId, model and messages are required.' });
  try {
    const account = await getAccount(accountId);
    if (!account) return res.status(404).json({ error: 'Account not found.' });
    const result = await complete({ providerId: account.providerId, model, apiKey: account.secret, baseUrl: account.baseUrl, messages, options: { temperature, maxTokens } });
    const response = { id: randomUUID(), ...result, createdAt: new Date().toISOString() };
    if (conversationId) await appendConversation({ ...(await getEntity('conversations', conversationId) || { id: conversationId, title: 'New conversation', isPinned: false, isArchived: false, createdAt: new Date().toISOString() }), messages, lastResponse: response, updatedAt: new Date().toISOString() });
    return res.json(response);
  } catch (error) { return res.status(502).json({ error: error.message || 'Provider request failed.' }); }
});

app.post('/api/chat/multi', async (req, res) => {
  const { accountId, models, messages, temperature, maxTokens } = req.body || {};
  if (!accountId || !Array.isArray(models) || models.length === 0 || !Array.isArray(messages) || messages.length === 0) return res.status(400).json({ error: 'accountId, models and messages are required.' });
  if (models.length > 5) return res.status(400).json({ error: 'A maximum of 5 models may be queried in one multi-model turn.' });
  try {
    const account = await getAccount(accountId);
    if (!account) return res.status(404).json({ error: 'Account not found.' });
    const results = await completeMany(buildChatRequests({ account, models, messages, temperature, maxTokens }));
    return res.json({ id: randomUUID(), createdAt: new Date().toISOString(), results });
  } catch (error) { return res.status(502).json({ error: error.message || 'Multi-model request failed.' }); }
});

app.post('/api/chat/synthesize', async (req, res) => {
  const { accountId, model, messages, sourceResponses, instruction, temperature, maxTokens } = req.body || {};
  if (!accountId || !model || !Array.isArray(sourceResponses) || sourceResponses.length === 0) return res.status(400).json({ error: 'accountId, model and sourceResponses are required.' });
  const sourceText = sourceResponses.map((item, index) => `MODEL ${index + 1} (${item.model || 'unknown'}):\n${item.content || ''}`).join('\n\n');
  const synthesisMessages = [
    ...(Array.isArray(messages) ? messages : []),
    { role: 'user', content: `Synthesize the following independent model responses. Do not assume they are correct. Identify meaningful disagreements and produce a grounded unified answer.\n\nInstruction: ${instruction || 'Compare the responses and produce the best answer.'}\n\n${sourceText}` },
  ];
  try {
    const account = await getAccount(accountId);
    if (!account) return res.status(404).json({ error: 'Account not found.' });
    const result = await complete({ providerId: account.providerId, model, apiKey: account.secret, baseUrl: account.baseUrl, messages: synthesisMessages, options: { temperature, maxTokens } });
    return res.json({ id: randomUUID(), ...result, createdAt: new Date().toISOString() });
  } catch (error) { return res.status(502).json({ error: error.message || 'Synthesis failed.' }); }
});

const dist = path.resolve(__dirname, '../dist');
app.use(express.static(dist));
app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
app.listen(port, '0.0.0.0', () => console.log(`AI Nexus server listening on ${port}`));
