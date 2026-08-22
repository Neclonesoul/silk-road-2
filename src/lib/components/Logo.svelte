<script lang="ts">
  import { brand } from '$lib/config';
  let {
    compact = false,
    name = brand.name,
    shortName = brand.shortName
  }: { compact?: boolean; name?: string; shortName?: string } = $props();
  const suffix = $derived(name.startsWith(shortName) ? name.slice(shortName.length).trim() : '');
</script>

<a class="logo" href="/" aria-label={`${name} home`}>
  <svg viewBox="0 0 48 48" aria-hidden="true"
    ><path d="M8 33c8-1 9-19 18-19 5 0 6 8 14 8" /><path
      d="M8 24c8 0 12 10 20 10 5 0 8-3 12-8"
    /><circle cx="8" cy="33" r="3" /><circle cx="40" cy="22" r="3" /></svg
  >
  {#if !compact}<span
      ><b>{shortName}</b>{#if suffix}<small>{suffix}</small>{/if}</span
    >{/if}
</a>

<style>
  .logo {
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    font-family: Georgia, serif;
    font-size: 1.15rem;
    letter-spacing: -0.02em;
  }
  svg {
    width: 38px;
    height: 38px;
    color: var(--gold);
  }
  path {
    fill: none;
    stroke: currentColor;
    stroke-width: 2.3;
    stroke-linecap: round;
  }
  circle {
    fill: currentColor;
  }
  span {
    display: flex;
    align-items: baseline;
    gap: 0.35rem;
    white-space: nowrap;
  }
  small {
    color: var(--gold);
    font: 700 0.68rem/1 ui-sans-serif;
    letter-spacing: 0.08em;
  }
</style>
