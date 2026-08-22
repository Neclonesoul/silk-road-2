<script lang="ts">
  import ListingCard from '$components/ListingCard.svelte';
  import EmptyState from '$components/EmptyState.svelte';
  let { data } = $props();
</script>

<svelte:head
  ><title>Favourites — {data.config.name}</title><meta
    name="robots"
    content="noindex"
  /></svelte:head
>
<div class="page shell">
  <div class="page-head">
    <div>
      <p class="eyebrow">Saved for later</p>
      <h1>Favourites</h1>
    </div>
  </div>
  {#if data.listings.length}<div class="listing-grid">
      {#each data.listings as listing}<ListingCard
          listing={listing as any}
          signedIn={true}
        />{/each}
    </div>{:else}<div class="surface">
      <EmptyState
        title="Nothing saved yet"
        copy="Tap the heart on a listing to keep it close while you compare."
        action="Explore listings"
        href="/search"
      />
    </div>{/if}
</div>
