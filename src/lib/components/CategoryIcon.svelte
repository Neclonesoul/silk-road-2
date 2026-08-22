<script lang="ts">
  import {
    Car,
    Zap,
    Smartphone,
    Laptop,
    Gamepad2,
    House,
    Building2,
    Shirt,
    Wrench,
    Bike,
    Gem,
    Package
  } from '@lucide/svelte';
  let { slug, size = 22 }: { slug: string; size?: number } = $props();
</script>

{#if slug === 'vehicles'}<Car {size} />{:else if slug === 'electronics'}<Zap
    {size}
  />{:else if slug === 'phones-tablets'}<Smartphone {size} />{:else if slug === 'computers'}<Laptop
    {size}
  />{:else if slug === 'gaming'}<Gamepad2 {size} />{:else if slug === 'home-garden'}<House
    {size}
  />{:else if slug === 'property'}<Building2 {size} />{:else if slug === 'fashion'}<Shirt
    {size}
  />{:else if slug === 'tools-equipment'}<Wrench {size} />{:else if slug === 'sports-outdoors'}<Bike
    {size}
  />{:else if slug === 'collectables'}<Gem {size} />{:else}<Package {size} />{/if}
