<script lang="ts">
  import type { Category } from '$lib/types';
  import CategoryIcon from './CategoryIcon.svelte';
  let { categories }: { categories: Category[] } = $props();
</script>

<div class="categories">
  {#each categories as category}<a href={`/search?category=${category.slug}`}
      ><span><CategoryIcon slug={category.slug} /></span><b>{category.name}</b
      >{#if category.listingCount}<small>{category.listingCount}</small>{/if}</a
    >{/each}
</div>

<style>
  .categories {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 92px;
    gap: 0.6rem;
    overflow-x: auto;
    padding: 0.2rem 0.05rem 0.65rem;
    scrollbar-width: none;
  }
  .categories::-webkit-scrollbar {
    display: none;
  }
  a {
    display: grid;
    justify-items: center;
    align-content: start;
    gap: 0.45rem;
    text-align: center;
    font-size: 0.73rem;
    line-height: 1.15;
    color: var(--muted);
  }
  span {
    width: 56px;
    height: 56px;
    display: grid;
    place-items: center;
    border: 1px solid var(--border);
    border-radius: 18px;
    background: var(--paper);
    color: var(--green-deep);
    transition: 0.16s;
  }
  a:hover span {
    transform: translateY(-2px);
    border-color: var(--gold);
  }
  b {
    font-weight: 700;
  }
  small {
    font-size: 0.65rem;
  }
  @media (min-width: 1000px) {
    .categories {
      grid-auto-flow: initial;
      grid-template-columns: repeat(12, 1fr);
      overflow: visible;
    }
    .categories a {
      min-width: 0;
    }
  }
</style>
