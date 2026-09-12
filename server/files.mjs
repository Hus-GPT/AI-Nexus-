import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = path.resolve(process.cwd(), 'data', 'files');
const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED_TEXT = new Set(['text/plain','text/markdown','application/json','text/csv','text/html','application/xml','text/xml']);

function safeName(name='file') {
  const cleaned = String(name).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0,160);
  return cleaned || 'file';
}

export async function saveBinaryFile({name, mimeType='application/octet-stream', data, ownerType, ownerId}) {
  if (!data || typeof data !== 'string') throw new Error('File data is required.');
  const buffer = Buffer.from(data, 'base64');
  if (!buffer.length) throw new Error('File is empty.');
  if (buffer.length > MAX_BYTES) throw new Error(`File exceeds the ${MAX_BYTES / 1024 / 1024} MB limit.`);
  const id = crypto.randomUUID();
  const dir = path.join(DATA_DIR, id);
  await fs.mkdir(dir, {recursive:true});
  await fs.writeFile(path.join(dir, safeName(name)), buffer, {mode:0o600});
  return {id, name:safeName(name), originalName:String(name||'file').slice(0,200), mimeType, size:buffer.length, ownerType:ownerType||null, ownerId:ownerId||null, storagePath:dir, createdAt:new Date().toISOString(), textExtractable:ALLOWED_TEXT.has(mimeType)};
}

export async function readBinaryFile(meta) {
  if (!meta?.storagePath || !meta?.name) throw new Error('Invalid file metadata.');
  const root = path.resolve(DATA_DIR);
  const target = path.resolve(meta.storagePath, meta.name);
  if (!target.startsWith(`${root}${path.sep}`)) throw new Error('Invalid file path.');
  return fs.readFile(target);
}

export async function deleteBinaryFile(meta) {
  if (!meta?.storagePath) return false;
  const root = path.resolve(DATA_DIR);
  const target = path.resolve(meta.storagePath);
  if (!target.startsWith(`${root}${path.sep}`)) throw new Error('Invalid file path.');
  await fs.rm(target, {recursive:true, force:true});
  return true;
}

export {MAX_BYTES};
