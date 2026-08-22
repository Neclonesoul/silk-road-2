import { appendFile, access } from 'node:fs/promises';

const entrypoint = new URL('../.svelte-kit/cloudflare/_worker.js', import.meta.url);

await access(entrypoint);
await appendFile(
  entrypoint,
  "\nexport { ChatRoom } from '../../src/lib/server/chat-room.ts';\n",
  'utf8'
);
