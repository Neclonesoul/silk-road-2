<script lang="ts">
  import { Bell } from '@lucide/svelte';
  import { relativeTime } from '$lib/utils';
  import EmptyState from '$components/EmptyState.svelte';
  let { data } = $props();
  const notifications = $derived(data.notifications as any[]);
</script>

<svelte:head
  ><title>Notifications — {data.config.name}</title><meta
    name="robots"
    content="noindex"
  /></svelte:head
>
<div class="page shell">
  <div class="page-head">
    <div>
      <p class="eyebrow">Marketplace updates</p>
      <h1>Notifications</h1>
    </div>
  </div>
  {#if notifications.length}<div class="surface list">
      {#each notifications as item}<a href={item.href || '/notifications'}
          ><span><Bell size={18} /></span>
          <div>
            <b>{item.title}</b>
            <p>{item.body}</p>
            <small>{relativeTime(item.created_at)}</small>
          </div></a
        >{/each}
    </div>{:else}<div class="surface">
      <EmptyState
        title="You’re all caught up"
        copy="Messages, listing updates and moderation notices will appear here."
      />
    </div>{/if}
</div>

<style>
  .list {
    overflow: hidden;
  }
  .list a {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.8rem;
    padding: 1rem;
    border-bottom: 1px solid var(--border);
  }
  .list a:last-child {
    border: 0;
  }
  .list > a > span {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: var(--green-deep);
    background: color-mix(in srgb, var(--green) 10%, var(--paper));
  }
  .list p {
    margin: 0.2rem 0;
    color: var(--muted);
    font-size: 0.84rem;
  }
  .list small {
    color: var(--muted);
    font-size: 0.7rem;
  }
</style>
