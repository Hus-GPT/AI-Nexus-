import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-nexus-store-'));
process.chdir(temp);
process.env.AI_NEXUS_SECRET = 'ci-only-ai-nexus-store-secret';

const store = await import('../server/store.mjs');
const checks = [];
const check = (name, ok) => checks.push([name, Boolean(ok)]);

const account = await store.saveAccount({
  providerId: 'google_gemini',
  label: 'CI Test Account',
  apiKey: 'ci-test-secret-key-123456',
});
const listed = await store.listAccounts();
const restored = await store.getAccount(account.id);
check('account is listed without secret', listed.length === 1 && !('secret' in listed[0]));
check('account secret decrypts server-side', restored?.secret === 'ci-test-secret-key-123456');
check('account key is masked', /^.{4}••••.{4}$/.test(account.apiKeyMasked));

const project = await store.upsertEntity('projects', { name: 'CI Project', description: 'verification' });
const fetchedProject = await store.getEntity('projects', project.id);
check('entity create and read', fetchedProject?.name === 'CI Project');
await store.upsertEntity('projects', { id: project.id, name: 'CI Project Updated' });
const updatedProject = await store.getEntity('projects', project.id);
check('entity update', updatedProject?.name === 'CI Project Updated');
check('entity delete', await store.deleteEntity('projects', project.id) === true);
check('deleted entity is absent', await store.getEntity('projects', project.id) === null);

await store.appendAudit('ci_verification', 'store', { checks: checks.length });
const audit = await store.listAudit();
check('audit entry persists', audit.some((x) => x.action === 'ci_verification'));

const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
await fs.rm(temp, { recursive: true, force: true });
if (failed.length) throw new Error(`${failed.length} store verification checks failed.`);
console.log(`AI Nexus store verification passed: ${checks.length} checks.`);
