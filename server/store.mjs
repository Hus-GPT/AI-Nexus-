import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const SECRET = process.env.AI_NEXUS_SECRET || 'development-only-change-me';

function key() { return crypto.createHash('sha256').update(SECRET).digest(); }
function encrypt(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  return JSON.stringify({ iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), data: ciphertext.toString('base64') });
}
function decrypt(payload) {
  const parsed = JSON.parse(payload);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(parsed.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(parsed.tag, 'base64'));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(parsed.data, 'base64')), decipher.final()]).toString('utf8'));
}

const EMPTY_STORE = { accounts: [], conversations: [], projects: [], assistants: [], memories: [], files: [], artifacts: [], tasks: [], notifications: [], audit: [], tools: [] };

export async function readStore() {
  try { return decrypt(await fs.readFile(STORE_FILE, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return structuredClone(EMPTY_STORE); throw error; }
}

export async function writeStore(store) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const temp = `${STORE_FILE}.${crypto.randomUUID()}.tmp`;
  await fs.writeFile(temp, encrypt(store), { mode: 0o600 });
  await fs.rename(temp, STORE_FILE);
}

export async function listAccounts() { return (await readStore()).accounts; }
export async function getAccount(id) { return (await readStore()).accounts.find((x) => x.id === id) || null; }
export async function saveAccount(account) { const s = await readStore(); s.accounts = s.accounts.filter((x) => x.id !== account.id); s.accounts.push(account); await writeStore(s); return account; }
export async function deleteAccount(id) { const s = await readStore(); s.accounts = s.accounts.filter((x) => x.id !== id); await writeStore(s); return true; }
export async function appendConversation(turn) { const s = await readStore(); s.conversations.push(turn); await writeStore(s); return turn; }
export async function listConversations() { return (await readStore()).conversations; }
export async function listEntities(type) { return (await readStore())[type] || []; }
export async function getEntity(type, id) { return (await readStore())[type]?.find((x) => x.id === id) || null; }
export async function upsertEntity(type, entity) { const s = await readStore(); if (!Array.isArray(s[type])) s[type] = []; s[type] = s[type].filter((x) => x.id !== entity.id); s[type].push(entity); await writeStore(s); return entity; }
export async function deleteEntity(type, id) { const s = await readStore(); if (Array.isArray(s[type])) s[type] = s[type].filter((x) => x.id !== id); await writeStore(s); return true; }
export async function appendAudit(entry) { const s = await readStore(); s.audit.push({ id: crypto.randomUUID(), at: new Date().toISOString(), ...entry }); await writeStore(s); }
export async function listAudit() { return (await readStore()).audit; }
