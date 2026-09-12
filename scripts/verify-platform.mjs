import fs from 'node:fs/promises';

const required = [
  'server/index.mjs',
  'server/providers.mjs',
  'server/store.mjs',
  'src/App.tsx',
  'src/main.tsx',
];

for (const file of required) {
  const text = await fs.readFile(file, 'utf8');
  if (!text.trim()) throw new Error(`Required file is empty: ${file}`);
}

const server = await fs.readFile('server/index.mjs', 'utf8');
const store = await fs.readFile('server/store.mjs', 'utf8');
const app = await fs.readFile('src/App.tsx', 'utf8');

const checks = [
  ['health endpoint', server.includes("/api/health")],
  ['account API', server.includes("/api/accounts")],
  ['conversation API', server.includes("/api/conversations")],
  ['project API', server.includes("/api/projects")],
  ['assistant API', server.includes("/api/assistants")],
  ['memory collection', server.includes("memories")],
  ['task collection', server.includes("tasks")],
  ['notification collection', server.includes("notifications")],
  ['multi-model endpoint', server.includes("/api/chat/multi")],
  ['synthesis endpoint', server.includes("/api/chat/synthesize")],
  ['encrypted account storage', store.includes('aes-256-gcm')],
  ['secret omitted from account list', store.includes('withoutSecret')],
  ['multi-account UI targets', app.includes('accountId') && app.includes('selected')],
  ['saved conversation loading', app.includes('/conversations/')],
];

const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
if (failed.length) throw new Error(`${failed.length} platform verification checks failed.`);
console.log(`AI Nexus platform verification passed: ${checks.length} checks.`);
