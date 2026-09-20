import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.mp3':'audio/mpeg', '.svg':'image/svg+xml', '.png':'image/png' };

export async function handler(request, response) {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  let decoded;
  try { decoded = decodeURIComponent(pathname); }
  catch { response.writeHead(400).end('Bad request'); return; }
  const target = resolve(root, `.${decoded === '/' ? '/index.html' : decoded}`);
  if (target !== root && !target.startsWith(root + sep)) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  try {
    const body = await readFile(target);
    response.writeHead(200, { 'Content-Type': types[extname(target)] || 'application/octet-stream', 'Cache-Control':'no-cache' });
    response.end(body);
  } catch {
    response.writeHead(404).end('Not found');
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.KOREAN_LEARNING_PORT) || 8765;
  createServer(handler).listen(port, '127.0.0.1', () => {
    console.log(`韩语学习页已启动：http://127.0.0.1:${port}/`);
  });
}
