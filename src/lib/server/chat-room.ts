interface Attachment {
  userId: string;
}

export class ChatRoom {
  constructor(private state: DurableObjectState) {}

  private sockets(): WebSocket[] {
    return this.state.getWebSockets();
  }

  private broadcast(payload: Record<string, unknown>, except?: WebSocket) {
    const encoded = JSON.stringify(payload);
    for (const socket of this.sockets()) {
      if (socket === except) continue;
      try {
        socket.send(encoded);
      } catch {
        try {
          socket.close(1011, 'Delivery failed');
        } catch {
          /* already closed */
        }
      }
    }
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.endsWith('/broadcast') && request.method === 'POST') {
      this.broadcast((await request.json()) as Record<string, unknown>);
      return new Response(null, { status: 204 });
    }
    if (request.headers.get('Upgrade') !== 'websocket')
      return new Response('Expected WebSocket', { status: 426 });
    const userId = request.headers.get('x-user-id');
    if (!userId) return new Response('Unauthorized', { status: 401 });
    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    this.state.acceptWebSocket(server);
    server.serializeAttachment({ userId } satisfies Attachment);
    this.broadcast({ type: 'presence', userId, state: 'online' }, server);
    return new Response(null, { status: 101, webSocket: client });
  }

  webSocketMessage(socket: WebSocket, message: ArrayBuffer | string) {
    if (typeof message !== 'string' || message.length > 500) return;
    try {
      const payload = JSON.parse(message) as { type?: string; active?: boolean };
      const attachment = socket.deserializeAttachment() as Attachment;
      if (payload.type === 'typing')
        this.broadcast(
          { type: 'typing', userId: attachment.userId, active: Boolean(payload.active) },
          socket
        );
      if (payload.type === 'ping') socket.send(JSON.stringify({ type: 'pong' }));
    } catch {
      socket.send(JSON.stringify({ type: 'error', message: 'Invalid event' }));
    }
  }

  webSocketClose(socket: WebSocket) {
    const attachment = socket.deserializeAttachment() as Attachment | null;
    if (attachment)
      this.broadcast({ type: 'presence', userId: attachment.userId, state: 'offline' }, socket);
  }
}
