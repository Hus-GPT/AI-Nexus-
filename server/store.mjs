import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const SECRET = process.env.AI_NEXUS_SECRET;
const key = SECRET ? crypto.createHash('sha256').update(SECRET).digest() : null;

const EMPTY_STORE = {
  accounts: [],
  conversations: [],
  projects: [],
  assistants: [],
  memories: [],
  files: [],
  artifacts: [],
  tasks: [],
  notifications: [],
  audit: [],
};

async function readStore() {
  try {
    const parsed = JSON.parse(await fs.readFile(STORE_FILE, 'utf8'));
    return { ...EMPTY_STORE, ...parsed };
  } catch {
    return structuredClone(EMPTY_STORE);
  }
}

async function writeStore(store) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const temporary = `${STORE_FILE}.tmp`;
  await fs.writeFile(temporary, JSON.stringify(store, null, 2), { mode: 0o600 });
  await fs.rename(temporary, STORE_FILE);
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

function withoutSecret(account) {
  const { secret: _secret, ...safe } = account;
  return safe;
}

export async function listAccounts() {
  return (await readStore()).accounts.map(withoutSecret);
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
  const now = new Date().toISOString();
  const existing = input.id ? store.accounts.find((item) => item.id === input.id) : null;
  const account = {
    id: existing?.id || input.id || crypto.randomUUID(),
    providerId: input.providerId,
    label: input.label.trim(),
    apiKeyMasked: `${input.apiKey.slice(0, 4)}••••${input.apiKey.slice(-4)}`,
    baseUrl: input.baseUrl || null,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    secret: encrypt(input.apiKey),
  };
  const index = store.accounts.findIndex((item) => item.id === account.id);
  if (index >= 0) store.accounts[index] = account; else store.accounts.push(account);
  store.audit.unshift({ id: crypto.randomUUID(), action: 'account_saved', targetEntity: account.id, at: now });
  await writeStore(store);
  return withoutSecret(account);
}

export async function deleteAccount(id) {
  const store = await readStore();
  const before = store.accounts.length;
  store.accounts = store.accounts.filter((item) => item.id !== id);
  if (store.accounts.length === before) return false;
  store.audit.unshift({ id: crypto.randomUUID(), action: 'account_deleted', targetEntity: id, at: new Date().toISOString() });
  await writeStore(store);
  return true;
}

export async function appendConversation(conversation) {
  return upsertEntity('conversations', conversation);
}

export async function listConversations() {
  return listEntities('conversations');
}

export async function listEntities(collection) {
  const store = await readStore();
  return store[collection] || [];
}

export async function getEntity(collection, id) {
  const store = await readStore();
  return (store[collection] || []).find((item) => item.id === id) || null;
}

export async function upsertEntity(collection, input) {
  if (!EMPTY_STORE[collection]) throw new Error(`Unknown collection: ${collection}`);
  if (!input?.id) input = { ...input, id: crypto.randomUUID() };
  const store = await readStore();
  const now = new Date().toISOString();
  const entity = { ...input, createdAt: input.createdAt || now, updatedAt: now };
  const index = store[collection].findIndex((item) => item.id === entity.id);
  if (index >= 0) store[collection][index] = entity; else store[collection].unshift(entity);
  await writeStore(store);
  return entity;
}

export async function deleteEntity(collection, id) {
  if (!EMPTY_STORE[collection]) throw new Error(`Unknown collection: ${collection}`);
  const store = await readStore();
  const before = store[collection].length;
  store[collection] = store[collection].filter((item) => item.id !== id);
  if (before === store[collection].length) return false;
  await writeStore(store);
  return true;
}

export async function appendAudit(action, targetEntity, details = {}, severity = 'info') {
  const store = await readStore();
  store.audit.unshift({ id: crypto.randomUUID(), action, targetEntity, details, severity, at: new Date().toISOString() });
  store.audit = store.audit.slice(0, 2000);
  await writeStore(store);
}

export async function listAudit() {
  return (await readStore()).audit;
}
