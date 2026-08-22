<script lang="ts">
  import { Edit3, MoreHorizontal, Plus } from '@lucide/svelte';
  import { formatMoney, relativeTime } from '$lib/utils';
  import EmptyState from '$components/EmptyState.svelte';
  let { data } = $props();
  const listings = $derived(data.listings as any[]);
  async function state(id: string, status: string) {
    if (!confirm(`Mark this listing ${status}?`)) return;
    const response = await fetch(`/api/listings/${id}/status`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (response.ok) location.reload();
  }
</script>

<svelte:head
  ><title>My listings — {data.config.name}</title><meta
    name="robots"
    content="noindex"
  /></svelte:head
>
<div class="page shell">
  <div class="page-head">
    <div>
      <p class="eyebrow">Seller inventory</p>
      <h1>My listings</h1>
    </div>
    <a class="btn btn-primary" href="/sell"><Plus size={18} /> New listing</a>
  </div>
  {#if listings.length}<div class="inventory">
      {#each listings as listing}<article class="surface">
          <a
            class="photo"
            href={listing.status === 'draft' ? `/sell/${listing.id}` : `/listings/${listing.slug}`}
            >{#if listing.cover_key}<img
                src={`/media/${listing.cover_key}`}
                alt=""
              />{:else}<MoreHorizontal />{/if}</a
          >
          <div class="copy">
            <div class="row between">
              <span class="status">{listing.status}</span><small
                >{relativeTime(listing.updated_at)}</small
              >
            </div>
            <h2>{listing.title}</h2>
            <p class="price">{formatMoney(listing.price_cents)}</p>
            <p class="muted tiny">{listing.category_name} · {listing.favorite_count} favourites</p>
          </div>
          <div class="actions">
            <a class="btn btn-secondary" href={`/sell/${listing.id}`}><Edit3 size={16} /> Edit</a
            >{#if listing.status === 'active'}<button
                class="btn btn-secondary"
                onclick={() => state(listing.id, 'reserved')}>Reserve</button
              ><button class="btn btn-secondary" onclick={() => state(listing.id, 'sold')}
                >Mark sold</button
              >{:else if listing.status === 'reserved'}<button
                class="btn btn-secondary"
                onclick={() => state(listing.id, 'active')}>Available</button
              ><button class="btn btn-secondary" onclick={() => state(listing.id, 'sold')}
                >Mark sold</button
              >{:else if listing.status === 'draft'}<a
                class="btn btn-primary"
                href={`/sell/${listing.id}`}>Finish listing</a
              >{/if}
          </div>
        </article>{/each}
    </div>{:else}<div class="surface">
      <EmptyState
        title="Your seller shelf is empty"
        copy="Create your first honest listing and open the marketplace for trade."
        action="Post your first listing"
        href="/sell"
      />
    </div>{/if}
</div>

<style>
  .inventory {
    display: grid;
    gap: 0.8rem;
  }
  article {
    display: grid;
    grid-template-columns: 100px 1fr;
    overflow: hidden;
  }
  .photo {
    display: grid;
    place-items: center;
    min-height: 125px;
    background: var(--canvas);
    color: var(--muted);
  }
  .photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .copy {
    min-width: 0;
    padding: 0.8rem;
  }
  .copy h2 {
    font: 750 1.05rem/1.2 ui-sans-serif;
    margin: 0.55rem 0 0.2rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .copy .price {
    margin: 0;
    font-size: 1.1rem;
  }
  .copy small {
    color: var(--muted);
  }
  .actions {
    grid-column: 1/-1;
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding: 0.7rem;
    border-top: 1px solid var(--border);
  }
  .actions .btn {
    flex: 0 0 auto;
    min-height: 40px;
    padding: 0.5rem 0.8rem;
    font-size: 0.78rem;
  }
  @media (min-width: 700px) {
    article {
      grid-template-columns: 140px 1fr auto;
      align-items: stretch;
    }
    .actions {
      grid-column: auto;
      border: 0;
      border-left: 1px solid var(--border);
      flex-direction: column;
      justify-content: center;
      min-width: 165px;
    }
    .photo {
      min-height: 150px;
    }
  }
</style>
