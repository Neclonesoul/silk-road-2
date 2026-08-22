<script lang="ts">
  import { ArrowRight, Camera, Check } from '@lucide/svelte';
  let { data, form } = $props();
  const result = $derived(form as any);
</script>

<svelte:head
  ><title>Sell something — {data.config.name}</title><meta
    name="robots"
    content="noindex"
  /></svelte:head
>
<div class="page shell">
  <div class="sell-head">
    <p class="eyebrow">List in minutes</p>
    <h1>What are you selling?</h1>
    <p>Start with the basics. You can save a draft at every step.</p>
  </div>
  <form class="surface start" method="POST">
    <div class="field">
      <label for="title">Listing title</label><input
        class="input"
        id="title"
        name="title"
        value={result?.title || ''}
        maxlength="100"
        required
        placeholder="e.g. Makita cordless drill set"
      /><span class="hint">Use the words a buyer would search for.</span>
    </div>
    <div class="field">
      <label for="category">Category</label><select
        class="select"
        id="category"
        name="categoryId"
        required
        ><option value="">Choose a category</option>{#each data.categories as category}<option
            value={category.id}
            selected={result?.categoryId === category.id}>{category.name}</option
          >{/each}</select
      >
    </div>
    {#if form?.message}<p class="alert">{form.message}</p>{/if}<button
      class="btn btn-primary"
      type="submit">Continue <ArrowRight size={18} /></button
    >
  </form>
  <div class="promise">
    <span><Camera /></span>
    <div>
      <h2>Photographs do the selling</h2>
      <p>Add clear, honest photos from several angles. The first becomes your cover.</p>
    </div>
    <ul>
      <li><Check /> Up to 12 photos</li>
      <li><Check /> Reorder any time</li>
      <li><Check /> Preview before publishing</li>
    </ul>
  </div>
</div>

<style>
  .sell-head {
    max-width: 650px;
    margin: 1rem auto 1.5rem;
    text-align: center;
  }
  .sell-head h1 {
    margin-bottom: 0.7rem;
  }
  .sell-head p {
    color: var(--muted);
  }
  .start {
    width: min(640px, 100%);
    margin: auto;
    padding: clamp(1rem, 4vw, 2rem);
    display: grid;
    gap: 1.1rem;
  }
  .promise {
    width: min(760px, 100%);
    margin: 2rem auto;
    display: grid;
    gap: 1rem;
    align-items: center;
  }
  .promise > span {
    width: 54px;
    height: 54px;
    display: grid;
    place-items: center;
    border-radius: 18px;
    color: var(--gold);
    background: color-mix(in srgb, var(--gold) 10%, var(--paper));
  }
  .promise h2,
  .promise p {
    margin-bottom: 0.25rem;
  }
  .promise p {
    color: var(--muted);
  }
  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem 1rem;
    padding: 0;
    margin: 0;
    list-style: none;
    color: var(--green-deep);
    font-size: 0.78rem;
    font-weight: 700;
  }
  li {
    display: flex;
    gap: 0.3rem;
    align-items: center;
  }
  li :global(svg) {
    width: 15px;
  }
  @media (min-width: 700px) {
    .promise {
      grid-template-columns: auto 1fr auto;
    }
  }
</style>
