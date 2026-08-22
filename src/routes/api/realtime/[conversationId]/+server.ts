import { error } from '@sveltejs/kit';
import { canAccessConversation, requireDb } from '$server/db';

export const GET = async ({ request, params, platform, locals }) => {
  if (!locals.user) error(401, 'Sign in required');
  const env = platform?.env;
  if (!env?.CHAT_ROOMS) error(503, 'Realtime messaging is unavailable');
  if (!(await canAccessConversation(requireDb(platform), params.conversationId, locals.user.id)))
    error(403, 'Conversation access denied');
  if (request.headers.get('upgrade')?.toLowerCase() !== 'websocket')
    error(426, 'WebSocket upgrade required');
  const id = env.CHAT_ROOMS.idFromName(params.conversationId);
  const headers = new Headers(request.headers);
  headers.set('x-user-id', locals.user.id);
  return env.CHAT_ROOMS.get(id).fetch(new Request(request, { headers }));
};
