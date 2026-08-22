<script lang="ts">
  import { AlertCircle } from '@lucide/svelte';
  import { brand } from '$lib/config';
  let { error, status }: { error: App.Error; status: number } = $props();
</script>

<svelte:head
  ><title>{status} — {brand.name}</title><meta name="robots" content="noindex" /></svelte:head
>
<div class="page shell">
  <div class="auth-card surface empty">
    <AlertCircle size={52} />
    <p class="eyebrow">Error {status}</p>
    <h1>
      {status === 404 ? 'Nothing here' : status === 403 ? 'Access denied' : 'Something went wrong'}
    </h1>
    <p>{error?.message || 'Please try again.'}</p>
    <div class="row">
      <a class="btn btn-primary" href="/">Marketplace home</a><button
        class="btn btn-secondary"
        onclick={() => history.back()}>Go back</button
      >
    </div>
    {#if error?.requestId}<small class="muted">Reference {error.requestId}</small>{/if}
  </div>
</div>
