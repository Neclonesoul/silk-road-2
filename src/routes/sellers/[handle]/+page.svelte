<script lang="ts">
  import { CalendarDays, Flag, MapPin, ShieldCheck } from '@lucide/svelte';
  import ListingCard from '$components/ListingCard.svelte';
  import EmptyState from '$components/EmptyState.svelte';
  let { data } = $props();
  const seller = $derived(data.seller as any);
  async function block() {
    if (!data.user) {
      location.href = `/auth/login?returnTo=${encodeURIComponent(location.pathname)}`;
      return;
    }
    const response = await fetch(`/api/blocks/${seller.user_id}`, {
      method: data.blocked ? 'DELETE' : 'PUT'
    });
    if (response.ok) location.reload();
  }
</script>

<svelte:head
  ><title>{seller.display_name} — Seller on {data.config.name}</title><meta
    name="description"
    content={`${seller.display_name}'s active marketplace listings.`}
  /><link rel="canonical" href={`${data.config.url}/sellers/${seller.handle}`} /></svelte:head
>
<div class="page shell">
  <section class="seller-head surface">
    <span class="avatar">{seller.display_name.slice(0, 1)}</span>
    <div>
      <p class="eyebrow">@{seller.handle}</p>
      <h1>{seller.display_name}</h1>
      <p class="facts">
        <span><MapPin size={16} />{seller.locality}, {seller.region}</span><span
          ><CalendarDays size={16} />Member since {new Date(seller.created_at).getFullYear()}</span
        >{#if seller.email_verified}<span class="verified"
            ><ShieldCheck size={16} />Email verified</span
          >{/if}
      </p>
    </div>
    <div class="actions">
      <button class="btn btn-secondary" onclick={block}>{data.blocked ? 'Unblock' : 'Block'}</button
      ><a class="btn btn-secondary" href={`/report?type=user&id=${seller.user_id}`}
        ><Flag size={15} /> Report</a
      >
    </div>
    <p class="bio">{seller.bio || 'This seller has not added a public bio yet.'}</p>
    <div class="trust">
      <span><b>{data.listings.length}</b> active listings</span><span
        ><b>{data.soldCount}</b> sold listings</span
      ><span><b>Not yet rated</b> reputation begins with real trades</span>
    </div>
  </section>
  <section class="listings">
    <div class="page-head">
      <div>
        <p class="eyebrow">Available now</p>
        <h2>Listings from {seller.display_name}</h2>
      </div>
    </div>
    {#if data.listings.length}<div class="listing-grid">
        {#each data.listings as listing}<ListingCard
            listing={listing as any}
            signedIn={Boolean(data.user)}
          />{/each}
      </div>{:else}<div class="surface">
        <EmptyState
          title="No active listings"
          copy="This seller has nothing available at the moment."
        />
      </div>{/if}
  </section>
</div>

<style>
  .seller-head {
    padding: clamp(1rem, 4vw, 2rem);
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
    align-items: center;
  }
  .avatar {
    width: 76px;
    height: 76px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--ink);
    color: var(--canvas);
    font-size: 2rem;
    font-weight: 850;
  }
  .seller-head h1 {
    font-size: clamp(2rem, 6vw, 3.4rem);
    margin: 0;
  }
  .facts {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    color: var(--muted);
    font-size: 0.78rem;
  }
  .facts span {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
  .facts .verified {
    color: var(--green-deep);
    font-weight: 750;
  }
  .actions {
    grid-column: 1/-1;
    display: flex;
    gap: 0.5rem;
  }
  .bio {
    grid-column: 1/-1;
    max-width: 64ch;
  }
  .trust {
    grid-column: 1/-1;
    display: grid;
    gap: 0.5rem;
    border-top: 1px solid var(--border);
    padding-top: 1rem;
  }
  .trust span {
    display: grid;
    color: var(--muted);
    font-size: 0.76rem;
  }
  .trust b {
    color: var(--ink);
    font-size: 0.9rem;
  }
  .listings {
    margin-top: 2rem;
  }
  @media (min-width: 760px) {
    .seller-head {
      grid-template-columns: auto 1fr auto;
    }
    .actions {
      grid-column: auto;
    }
    .trust {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
