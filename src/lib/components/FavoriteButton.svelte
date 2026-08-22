<script lang="ts">
  import { Heart } from '@lucide/svelte';
  let {
    listingId,
    initial = false,
    signedIn = false
  }: { listingId: string; initial?: boolean; signedIn?: boolean } = $props();
  let active = $state(false);
  let busy = $state(false);
  $effect.pre(() => {
    active = initial;
  });
  async function toggle(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!signedIn) {
      location.href = `/auth/login?returnTo=${encodeURIComponent(location.pathname)}`;
      return;
    }
    busy = true;
    const before = active;
    active = !active;
    try {
      const response = await fetch(`/api/favorites/${listingId}`, {
        method: active ? 'PUT' : 'DELETE'
      });
      if (!response.ok) throw new Error();
    } catch {
      active = before;
    } finally {
      busy = false;
    }
  }
</script>

<button
  type="button"
  class:active
  onclick={toggle}
  disabled={busy}
  aria-label={active ? 'Remove from favourites' : 'Add to favourites'}
  aria-pressed={active}><Heart size={20} fill={active ? 'currentColor' : 'none'} /></button
>

<style>
  button {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    border: 1px solid color-mix(in srgb, var(--border) 75%, transparent);
    border-radius: 50%;
    background: color-mix(in srgb, var(--paper) 88%, transparent);
    color: var(--ink);
    cursor: pointer;
    backdrop-filter: blur(10px);
  }
  button.active {
    color: var(--danger);
  }
  button:active {
    transform: scale(0.92);
  }
</style>
