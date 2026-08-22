<script lang="ts">
  import { WifiOff } from '@lucide/svelte';
  let { data } = $props();
</script>

<svelte:head
  ><title>Offline — {data.config.name}</title><meta name="robots" content="noindex" /></svelte:head
>
<div class="page shell">
  <div class="auth-card surface empty">
    <WifiOff size={52} />
    <h1>You’re offline</h1>
    <p>
      Previously loaded public pages may still be available. Reconnect before publishing,
      favouriting, messaging or changing a listing.
    </p>
    <button class="btn btn-primary" onclick={() => location.reload()}>Try again</button>
  </div>
</div>
