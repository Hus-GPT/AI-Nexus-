import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { listAccounts, getAccount, saveAccount, deleteAccount, appendConversation, listConversations } from './store.mjs';
import { catalogModels, complete } from './providers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3001);

app.use(express.json({ limit: '25mb' }));
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'ai-nexus', time: new Date().toISOString() }));
app.get('/api/models', (_req, res) => res.json({ models: catalogModels() }));
app.get('/api/accounts', async (_req, res) => res.json({ accounts: await listAccounts() }));
app.post('/api/accounts', async (req, res) => { try { res.status(201).json({ account: await saveAccount(req.body) }); } catch (error) { res.status(400).json({ error: error.message }); } });
app.delete('/api/accounts/:id', async (req, res) => res.json({ deleted: await deleteAccount(req.params.id) }));
app.get('/api/conversations', async (_req, res) => res.json({ conversations: await listConversations() }));

app.post('/api/chat', async (req, res) => {
  const { accountId, model, messages, temperature, maxTokens, conversationId } = req.body || {};
  if (!accountId || !model || !Array.isArray(messages) || messages.length === 0) return res.status(400).json({ error: 'accountId, model and messages are required.' });
  try {
    const account = await getAccount(accountId);
    if (!account) return res.status(404).json({ error: 'Account not found.' });
    const result = await complete({ providerId: account.providerId, model, apiKey: account.secret, baseUrl: account.baseUrl, messages, options: { temperature, maxTokens } });
    if (conversationId) await appendConversation({ id: conversationId, updatedAt: new Date().toISOString(), messages, lastResponse: result });
    res.json({ id: randomUUID(), ...result });
  } catch (error) { res.status(502).json({ error: error.message || 'Provider request failed.' }); }
});

const dist = path.resolve(__dirname, '../dist');
app.use(express.static(dist));
app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
app.listen(port, '0.0.0.0', () => console.log(`AI Nexus server listening on ${port}`));
