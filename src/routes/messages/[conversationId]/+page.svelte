<script lang="ts">
  import { ArrowLeft, Circle, Send, ShieldAlert } from '@lucide/svelte';
  import { formatMoney, relativeTime } from '$lib/utils';

  let { data, form } = $props();

  const conversation = $derived(data.conversation as any);
  const currentUserId = $derived(data.user!.id);

  let messages = $state<any[]>([]);
  let typing = $state(false);
  let connection = $state('connecting');

  let socket: WebSocket | undefined;
  let retryTimer: number | undefined;
  let heartbeatTimer: number | undefined;
  let typingTimer: number | undefined;

  $effect.pre(() => {
    messages = [...data.messages];
  });

  $effect(() => {
    const conversationId = conversation.id;
    let disposed = false;
    let retryAttempt = 0;

    const clearHeartbeat = () => {
      if (heartbeatTimer !== undefined) {
        window.clearInterval(heartbeatTimer);
        heartbeatTimer = undefined;
      }
    };

    const connect = () => {
      if (disposed) return;

      connection = retryAttempt ? 'reconnecting' : 'connecting';

      const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${location.host}/api/realtime/${conversationId}`);

      socket = ws;

      ws.onopen = () => {
        retryAttempt = 0;
        connection = 'live';

        clearHeartbeat();

        heartbeatTimer = window.setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 25_000);
      };

      ws.onmessage = (event) => {
        const payload = JSON.parse(event.data);

        if (payload.type === 'message' && !messages.some((message) => message.id === payload.id)) {
          messages = [
            ...messages,
            {
              id: payload.id,
              sender_id: payload.senderId,
              content: payload.content,
              created_at: payload.createdAt
            }
          ];
        }

        if (payload.type === 'typing') {
          typing = payload.active;
        }
      };

      ws.onerror = () => {
        console.error('realtime websocket error', {
          url: ws.url,
          readyState: ws.readyState
        });
      };

      ws.onclose = (event) => {
        clearHeartbeat();

        console.error('realtime websocket closed', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          url: ws.url
        });

        if (disposed) return;

        connection =
          event.code || event.reason
            ? `reconnecting · ${event.code}${event.reason ? ` · ${event.reason}` : ''}`
            : 'reconnecting';
        retryAttempt += 1;

        const delay = Math.min(1000 * 2 ** Math.min(retryAttempt - 1, 4), 15_000);

        retryTimer = window.setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      disposed = true;

      if (retryTimer !== undefined) {
        window.clearTimeout(retryTimer);
      }

      clearHeartbeat();

      if (socket && socket.readyState < WebSocket.CLOSING) {
        socket.close(1000, 'Conversation closed');
      }
    };
  });

  function sendTyping() {
    if (socket?.readyState !== WebSocket.OPEN) return;

    socket.send(JSON.stringify({ type: 'typing', active: true }));

    if (typingTimer !== undefined) {
      window.clearTimeout(typingTimer);
    }

    typingTimer = window.setTimeout(() => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'typing', active: false }));
      }
    }, 1200);
  }
</script>

<svelte:head
  ><title>Conversation — {data.config.name}</title><meta
    name="robots"
    content="noindex"
  /></svelte:head
>
<div class="chat">
  <header>
    <a href="/messages" aria-label="Back to messages"><ArrowLeft /></a>
    <div>
      <b>{conversation.title}</b><span
        >{formatMoney(conversation.price_cents)} · {conversation.listing_status}</span
      >
    </div>
    <a href={`/listings/${conversation.slug}`}>View item</a>
  </header>
  <div class="connection">
    <Circle size={9} fill="currentColor" />
    {connection}{#if typing}
      · typing…{/if}
  </div>
  <section class="thread" aria-live="polite">
    {#each messages as message}<article class:mine={message.sender_id === currentUserId}>
        <p>{message.content}</p>
        <time>{relativeTime(message.created_at)}</time>
      </article>{/each}
  </section>
  {#if form?.message}<p class="alert">{form.message}</p>{/if}
  <form class="composer" method="POST" action="?/send">
    <label class="sr-only" for="content">Message</label><textarea
      id="content"
      name="content"
      maxlength="2000"
      rows="1"
      required
      placeholder="Write a message…"
      oninput={sendTyping}
    ></textarea><button type="submit" aria-label="Send message"><Send /></button>
  </form>
  <p class="safety">
    <ShieldAlert size={14} /> Keep payment and collection details in this conversation. Report suspicious
    requests.
  </p>
</div>

<style>
  .chat {
    width: min(820px, 100%);
    height: calc(100dvh - 70px);
    margin: auto;
    display: grid;
    grid-template-rows: auto auto 1fr auto auto;
    background: var(--paper);
    border-inline: 1px solid var(--border);
  }
  header {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 0.7rem;
    padding: 0.8rem;
    border-bottom: 1px solid var(--border);
  }
  header > a:first-child {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
  }
  header div {
    min-width: 0;
    display: grid;
  }
  header b {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  header span {
    color: var(--muted);
    font-size: 0.75rem;
  }
  header > a:last-child {
    color: var(--green-deep);
    font-size: 0.78rem;
    font-weight: 750;
  }
  .connection {
    padding: 0.35rem;
    text-align: center;
    color: var(--muted);
    font-size: 0.7rem;
  }
  .thread {
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    padding: 1rem;
  }
  .thread article {
    max-width: 78%;
    align-self: flex-start;
  }
  .thread article.mine {
    align-self: flex-end;
  }
  .thread p {
    margin: 0;
    padding: 0.65rem 0.8rem;
    border-radius: 16px 16px 16px 4px;
    background: var(--canvas);
    white-space: pre-wrap;
  }
  .thread .mine p {
    border-radius: 16px 16px 4px 16px;
    background: var(--green);
    color: #fff;
  }
  .thread time {
    display: block;
    margin: 0.2rem 0.35rem 0;
    color: var(--muted);
    font-size: 0.65rem;
  }
  .thread .mine time {
    text-align: right;
  }
  .composer {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: end;
    gap: 0.5rem;
    padding: 0.7rem;
    border-top: 1px solid var(--border);
  }
  textarea {
    max-height: 120px;
    resize: none;
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 0.75rem;
    background: var(--canvas);
    color: var(--ink);
  }
  .composer button {
    width: 46px;
    height: 46px;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 50%;
    background: var(--green);
    color: #fff;
    cursor: pointer;
  }
  .safety {
    margin: 0;
    padding: 0.35rem 1rem calc(0.35rem + env(safe-area-inset-bottom));
    text-align: center;
    color: var(--muted);
    font-size: 0.65rem;
  }
  .safety :global(svg) {
    display: inline;
    vertical-align: middle;
  }
  @media (max-width: 819px) {
    .chat {
      height: calc(100dvh - 138px);
    }
  }
</style>
