import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { handler } from '../server.js';

test('local server returns the learning page and JS modules', async () => {
  const server = createServer(handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    const page = await fetch(base);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /韩文拼读/);
    const module = await fetch(`${base}/data.js`);
    assert.equal(module.status, 200);
    assert.match(module.headers.get('content-type'), /javascript/);
    const manifest = await fetch(`${base}/audio/manifest.json`);
    assert.equal(manifest.status, 200);
    assert.match(manifest.headers.get('content-type'), /application\/json/);
    assert.equal(Object.keys((await manifest.json()).items).length, 149);
    const audio = await fetch(`${base}/audio/64ee5293d31bc58b72d76ae9.mp3`);
    assert.equal(audio.status, 200);
    assert.match(audio.headers.get('content-type'), /audio\/mpeg/);
    assert.ok((await audio.arrayBuffer()).byteLength > 1000);
    const missing = await fetch(`${base}/not-found.js`);
    assert.equal(missing.status, 404);
  } finally {
    server.close();
  }
});
