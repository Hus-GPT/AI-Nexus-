import assert from 'node:assert/strict';
import { mkdtemp, rm, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const source=await import('../server/files.mjs');
const root=await mkdtemp(path.join(os.tmpdir(),'ai-nexus-files-'));
try {
  const original=process.cwd;
  process.chdir(root);
  const meta=await source.saveBinaryFile({name:'hello.txt',mimeType:'text/plain',data:Buffer.from('AI Nexus file test','utf8').toString('base64')});
  assert.equal(meta.size,18);
  const data=await source.readBinaryFile(meta);
  assert.equal(data.toString('utf8'),'AI Nexus file test');
  assert.equal((await stat(path.join(meta.storagePath,meta.name))).size,18);
  await source.deleteBinaryFile(meta);
  process.chdir(original);
  console.log('PASS file storage round-trip');
} finally { await rm(root,{recursive:true,force:true}); }
