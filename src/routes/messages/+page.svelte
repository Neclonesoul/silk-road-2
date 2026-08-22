<script lang="ts">
  import { formatMoney, relativeTime } from '$lib/utils';
  import EmptyState from '$components/EmptyState.svelte';
  let { data } = $props();
  const conversations = $derived(data.conversations as any[]);
</script>

<svelte:head
  ><title>Messages — {data.config.name}</title><meta name="robots" content="noindex" /></svelte:head
>
<div class="page shell">
  <div class="page-head">
    <div>
      <p class="eyebrow">Direct conversations</p>
      <h1>Messages</h1>
    </div>
  </div>
  {#if conversations.length}<div class="surface inbox">
      {#each conversations as conversation}<a href={`/messages/${conversation.id}`}
          ><span class="avatar">{String(conversation.other_name).slice(0, 1)}</span><span
            class="copy"
            ><b>{conversation.other_name}</b><small
              >{conversation.title} · {formatMoney(conversation.price_cents)}</small
            >
            <p>{conversation.last_message || 'Start the conversation'}</p></span
          ><span class="meta"
            ><small>{relativeTime(conversation.last_message_at)}</small
            >{#if conversation.unread_count}<em>{conversation.unread_count}</em>{/if}</span
          ></a
        >{/each}
    </div>{:else}<div class="surface">
      <EmptyState
        title="No conversations yet"
        copy="When you contact a seller—or a buyer contacts you—your listing-focused conversation will appear here."
        action="Explore listings"
        href="/search"
      />
    </div>{/if}
</div>

<style>
  .inbox {
    overflow: hidden;
  }
  .inbox > a {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0.8rem;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--border);
  }
  .inbox > a:last-child {
    border: 0;
  }
  .avatar {
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--ink);
    color: var(--canvas);
    font-weight: 850;
  }
  .copy {
    min-width: 0;
    display: grid;
  }
  .copy small,
  .meta small {
    color: var(--muted);
    font-size: 0.72rem;
  }
  .copy p {
    margin: 0.2rem 0 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.85rem;
  }
  .meta {
    display: grid;
    justify-items: end;
    gap: 0.4rem;
  }
  .meta em {
    min-width: 22px;
    height: 22px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--green);
    color: #fff;
    font-size: 0.7rem;
    font-style: normal;
    font-weight: 800;
  }
</style>
