<script lang="ts">
  import { Search, SlidersHorizontal } from '@lucide/svelte';
  let { value = '', large = false }: { value?: string; large?: boolean } = $props();
</script>

<form class:large action="/search" role="search">
  <Search aria-hidden="true" /><label class="sr-only" for="market-search">Search listings</label
  ><input
    id="market-search"
    name="q"
    {value}
    placeholder="What are you looking for?"
    autocomplete="off"
  /><button type="submit">Search</button><a href="/search" aria-label="Open search filters"
    ><SlidersHorizontal /></a
  >
</form>

<style>
  form {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    align-items: center;
    gap: 0.55rem;
    width: 100%;
    padding: 0.35rem 0.4rem 0.35rem 0.85rem;
    background: var(--paper);
    border: 1px solid var(--border);
    border-radius: 16px;
    box-shadow: var(--shadow);
  }
  form.large {
    min-height: 64px;
  }
  input {
    min-width: 0;
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--ink);
    font-size: 1rem;
  }
  button {
    min-height: 44px;
    border: 0;
    border-radius: 12px;
    padding: 0 1rem;
    background: var(--green);
    color: #fff;
    font-weight: 750;
    cursor: pointer;
  }
  a {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    color: var(--muted);
  }
  form > :global(svg) {
    width: 20px;
    color: var(--muted);
  }
  @media (max-width: 520px) {
    button {
      display: none;
    }
  }
</style>
