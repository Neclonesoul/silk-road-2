<script lang="ts">
  import { Image as ImageIcon } from '@lucide/svelte';
</script>

<div>
  <svg viewBox="0 0 240 180" aria-hidden="true"
    ><path d="M-15 150C40 110 72 150 120 96s80-8 135-62" /><path
      d="M-10 126c54-30 94 28 137-16s78-5 122-50"
    /></svg
  ><ImageIcon size={28} /><span>Photograph coming soon</span>
</div>

<style>
  div {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 150px;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 0.4rem;
    background: color-mix(in srgb, var(--gold) 6%, var(--canvas));
    color: var(--muted);
    overflow: hidden;
  }
  svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0.3;
  }
  path {
    fill: none;
    stroke: var(--gold);
    stroke-width: 2;
  }
  span {
    font-size: 0.72rem;
  }
</style>
