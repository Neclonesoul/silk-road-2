<script lang="ts">
  import { ArrowRight, Sparkles } from '@lucide/svelte';
  import SearchBar from '$components/SearchBar.svelte';
  import CategoryGrid from '$components/CategoryGrid.svelte';
  import ListingCard from '$components/ListingCard.svelte';
  import EmptyState from '$components/EmptyState.svelte';
  let { data } = $props();
</script>

<svelte:head><link rel="canonical" href={data.config.url} /></svelte:head>
<div class="page">
  <section class="shell intro">
    <div>
      <p class="eyebrow">The direct marketplace</p>
      <h1>Find it. Sell it.<br /><i>Talk directly.</i></h1>
    </div>
    <p>Remarkable finds and everyday essentials, traded person to person.</p>
  </section>
  <section class="shell search"><SearchBar large /></section>
  <section class="shell section">
    <div class="section-head">
      <h2>Browse categories</h2>
      <a href="/search">View all <ArrowRight size={16} /></a>
    </div>
    <CategoryGrid categories={data.categories} />
  </section>
  <section class="shell section">
    <div class="section-head">
      <div>
        <p class="eyebrow">Fresh near you</p>
        <h2>Recently listed</h2>
      </div>
      <a href="/search?sort=newest">See everything <ArrowRight size={16} /></a>
    </div>
    {#if data.fresh.length}<div class="listing-grid">
        {#each data.fresh as listing}<ListingCard {listing} signedIn={Boolean(data.user)} />{/each}
      </div>{:else}<div class="surface">
        <EmptyState
          title="Be among the first"
          copy="This marketplace is new and ready for its first real listings. Your item could be the first thing someone discovers."
          action="Sell something"
          href="/sell"
        />
      </div>{/if}
  </section>
  <section class="shell sell-cta surface">
    <div class="mark"><Sparkles /></div>
    <div>
      <p class="eyebrow">Ready when you are</p>
      <h2>Turn something unused into something useful.</h2>
      <p>Photograph it, describe it, set your price and talk directly to buyers.</p>
    </div>
    <a class="btn btn-primary" href="/sell">Post a listing</a>
  </section>
</div>

<style>
  .intro {
    display: grid;
    gap: 1rem;
    padding-top: 1.6rem;
  }
  .intro h1 {
    margin: 0;
    max-width: 820px;
  }
  .intro h1 i {
    color: var(--green-deep);
    font-weight: 400;
  }
  .intro > p {
    max-width: 42ch;
    color: var(--muted);
    font-size: 1.05rem;
  }
  .search {
    margin-top: 1.3rem;
  }
  .section {
    margin-top: 2.4rem;
  }
  .section-head {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  .section-head h2 {
    margin: 0;
  }
  .section-head > a {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    color: var(--green-deep);
    font-size: 0.84rem;
    font-weight: 750;
    white-space: nowrap;
  }
  .sell-cta {
    margin-top: 3rem;
    padding: clamp(1.25rem, 4vw, 2.5rem);
    display: grid;
    align-items: center;
    gap: 1.2rem;
  }
  .sell-cta h2 {
    max-width: 650px;
  }
  .sell-cta p {
    color: var(--muted);
  }
  .mark {
    width: 54px;
    height: 54px;
    border-radius: 18px;
    display: grid;
    place-items: center;
    color: var(--gold);
    background: color-mix(in srgb, var(--gold) 10%, var(--paper));
  }
  @media (min-width: 760px) {
    .intro {
      grid-template-columns: 1fr auto;
      align-items: end;
      padding-top: 3rem;
    }
    .intro > p {
      max-width: 300px;
    }
    .sell-cta {
      grid-template-columns: auto 1fr auto;
    }
  }
</style>
