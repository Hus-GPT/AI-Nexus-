import assert from 'node:assert/strict';
import { mkdtemp, rm, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const root=await mkdtemp(path.join(os.tmpdir(),'ai-nexus-files-'));
const original=process.cwd();
try {
  process.chdir(root);
  const source=await import(`../server/files.mjs?test=${Date.now()}`);
  const payload=Buffer.from('AI Nexus file test','utf8').toString('base64');
  const meta=await source.saveBinaryFile({name:'hello.txt',mimeType:'text/plain',data:payload});
  assert.equal(meta.size,18);
  const data=await source.readBinaryFile(meta);
  assert.equal(data.toString('utf8'),'AI Nexus file test');
  assert.equal((await stat(path.join(meta.storagePath,meta.name))).size,18);
  await source.deleteBinaryFile(meta);
  console.log('PASS file storage round-trip');
} finally {
  process.chdir(original);
  await rm(root,{recursive:true,force:true});
}
