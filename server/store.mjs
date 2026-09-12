import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const SECRET = process.env.AI_NEXUS_SECRET;

if (!SECRET) {
  console.warn('AI_NEXUS_SECRET is not set. Account-key persistence is disabled until a secret is configured.');
}

const key = SECRET ? crypto.createHash('sha256').update(SECRET).digest() : null;

async function readStore() {
  try {
    return JSON.parse(await fs.readFile(STORE_FILE, 'utf8'));
  } catch {
    return { accounts: [], conversations: [], projects: [], assistants: [], audit: [] };
  }
}

async function writeStore(store) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), { mode: 0o600 });
}

function encrypt(value) {
  if (!key) throw new Error('Server secret is not configured. Set AI_NEXUS_SECRET before saving API keys.');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return `${iv.toString('base64url')}.${cipher.getAuthTag().toString('base64url')}.${encrypted.toString('base64url')}`;
}

function decrypt(value) {
  if (!key) throw new Error('Server secret is not configured.');
  const [iv, tag, data] = value.split('.').map((x) => Buffer.from(x, 'base64url'));
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}

export async function listAccounts() {
  const store = await readStore();
  return store.accounts.map(({ secret, ...safe }) => safe);
}

export async function getAccount(id) {
  const store = await readStore();
  const account = store.accounts.find((item) => item.id === id);
  if (!account) return null;
  return { ...account, secret: decrypt(account.secret) };
}

export async function saveAccount(input) {
  if (!input?.providerId || !input?.label || !input?.apiKey) throw new Error('providerId, label and apiKey are required.');
  const store = await readStore();
  const account = {
    id: input.id || crypto.randomUUID(),
    providerId: input.providerId,
    label: input.label.trim(),
    apiKeyMasked: `${input.apiKey.slice(0, 4)}••••${input.apiKey.slice(-4)}`,
    baseUrl: input.baseUrl || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    secret: encrypt(input.apiKey),
  };
  const index = store.accounts.findIndex((item) => item.id === account.id);
  if (index >= 0) store.accounts[index] = account; else store.accounts.push(account);
  store.audit.unshift({ id: crypto.randomUUID(), action: 'account_saved', providerId: account.providerId, at: account.updatedAt });
  await writeStore(store);
  const { secret, ...safe } = account;
  return safe;
}

export async function deleteAccount(id) {
  const store = await readStore();
  const before = store.accounts.length;
  store.accounts = store.accounts.filter((item) => item.id !== id);
  if (store.accounts.length === before) return false;
  store.audit.unshift({ id: crypto.randomUUID(), action: 'account_deleted', accountId: id, at: new Date().toISOString() });
  await writeStore(store);
  return true;
}

export async function appendConversation(conversation) {
  const store = await readStore();
  const index = store.conversations.findIndex((item) => item.id === conversation.id);
  if (index >= 0) store.conversations[index] = conversation; else store.conversations.unshift(conversation);
  await writeStore(store);
  return conversation;
}

export async function listConversations() {
  return (await readStore()).conversations;
}
