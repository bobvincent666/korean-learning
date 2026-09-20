import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { groups } from '../data.js';
import { makeManifest } from './audio-corpus.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
await mkdir(resolve(root, 'audio'), { recursive: true });
const manifest = makeManifest(groups);
await writeFile(resolve(root, 'audio/manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Exported ${Object.keys(manifest.items).length} Korean utterances`);
