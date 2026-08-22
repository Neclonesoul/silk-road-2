<script lang="ts">
  import { SearchX } from '@lucide/svelte';
  import SearchBar from '$components/SearchBar.svelte';
  import ListingCard from '$components/ListingCard.svelte';
  let { data } = $props();
  let filtersOpen = $state(false);
  const filters = $derived(data.filters as any);
</script>

<svelte:head
  ><title>Search listings — {data.config.name}</title><meta
    name="robots"
    content="noindex,follow"
  /></svelte:head
>
<div class="page shell">
  <div class="page-head">
    <div>
      <p class="eyebrow">Explore the market</p>
      <h1>Search</h1>
    </div>
  </div>
  <SearchBar value={filters.q || ''} large />
  <div class="mobile-filter">
    <button class="btn btn-secondary" onclick={() => (filtersOpen = !filtersOpen)}
      >Filters {filtersOpen ? '−' : '+'}</button
    >
  </div>
  <div class="search-layout">
    <aside class:open={filtersOpen} class="surface">
      <form method="GET">
        <div class="field">
          <label for="filter-q">Keywords</label><input
            class="input"
            id="filter-q"
            name="q"
            value={filters.q || ''}
          />
        </div>
        <div class="field">
          <label for="category">Category</label><select class="select" id="category" name="category"
            ><option value="">All categories</option>{#each data.categories as category}<option
                value={category.slug}
                selected={filters.category === category.slug}>{category.name}</option
              >{/each}</select
          >
        </div>
        <div class="two-col">
          <div class="field">
            <label for="min">Min price</label><input
              class="input"
              id="min"
              name="minPrice"
              inputmode="numeric"
              value={filters.minPrice || ''}
            />
          </div>
          <div class="field">
            <label for="max">Max price</label><input
              class="input"
              id="max"
              name="maxPrice"
              inputmode="numeric"
              value={filters.maxPrice || ''}
            />
          </div>
        </div>
        <div class="field">
          <label for="condition">Condition</label><select
            class="select"
            id="condition"
            name="condition"
            ><option value="">Any condition</option
            >{#each ['new', 'like-new', 'good', 'fair', 'parts'] as condition}<option
                value={condition}
                selected={filters.condition === condition}>{condition.replace('-', ' ')}</option
              >{/each}</select
          >
        </div>
        <div class="field">
          <label for="location">Location</label><input
            class="input"
            id="location"
            name="location"
            value={filters.location || ''}
            placeholder="City or region"
          />
        </div>
        <div class="field">
          <label for="date">Listed</label><select class="select" id="date" name="date"
            ><option value="">Any time</option><option value="day" selected={filters.date === 'day'}
              >Today</option
            ><option value="week" selected={filters.date === 'week'}>This week</option><option
              value="month"
              selected={filters.date === 'month'}>This month</option
            ></select
          >
        </div>
        <div class="field">
          <label for="sort">Sort</label><select class="select" id="sort" name="sort"
            ><option value="newest" selected={filters.sort === 'newest'}>Newest</option><option
              value="price-asc"
              selected={filters.sort === 'price-asc'}>Price low to high</option
            ><option value="price-desc" selected={filters.sort === 'price-desc'}
              >Price high to low</option
            ></select
          >
        </div>
        <button class="btn btn-primary" type="submit">Apply filters</button><a
          class="btn btn-secondary"
          href="/search">Clear</a
        >
      </form>
    </aside>
    <section>
      <div class="results-head">
        <p>
          <b>{data.results.length}</b>
          {data.results.length === 1 ? 'listing' : 'listings'} on this page
        </p>
      </div>
      {#if data.results.length}<div class="listing-grid">
          {#each data.results as listing}<ListingCard
              {listing}
              signedIn={Boolean(data.user)}
            />{/each}
        </div>{:else}<div class="empty surface">
          <SearchX size={52} />
          <h2>No matching listings</h2>
          <p>
            Try a broader category, price range or location. New items arrive as sellers post them.
          </p>
          <a class="btn btn-secondary" href="/search">Clear filters</a>
        </div>{/if}
    </section>
  </div>
</div>

<style>
  .mobile-filter {
    margin: 1rem 0;
  }
  .search-layout {
    display: grid;
    gap: 1.2rem;
    margin-top: 1rem;
  }
  aside {
    display: none;
    padding: 1rem;
  }
  aside.open {
    display: block;
  }
  form {
    display: grid;
    gap: 1rem;
  }
  .results-head {
    min-height: 44px;
    color: var(--muted);
  }
  .results-head p {
    margin: 0;
  }
  .empty :global(svg) {
    color: var(--gold);
  }
  @media (min-width: 860px) {
    .mobile-filter {
      display: none;
    }
    .search-layout {
      grid-template-columns: 260px 1fr;
      align-items: start;
      margin-top: 1.5rem;
    }
    aside {
      display: block;
      position: sticky;
      top: 88px;
    }
    .listing-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
</style>
