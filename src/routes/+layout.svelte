<script lang="ts">
  import '../app.css';
  import Header from '$components/Header.svelte';
  import BottomNav from '$components/BottomNav.svelte';
  let { data, children } = $props();
</script>

<svelte:head
  ><title>{data.config.name} — {data.config.proposition}</title><meta
    name="description"
    content={data.config.description}
  /><meta property="og:title" content={data.config.name} /><meta
    property="og:description"
    content={data.config.proposition}
  /><meta property="og:type" content="website" /><meta
    property="og:image"
    content={`${data.config.url}/og-image.png`}
  /><meta name="twitter:card" content="summary_large_image" /><meta
    name="twitter:image"
    content={`${data.config.url}/og-image.png`}
  /></svelte:head
>
<a class="skip-link" href="#content">Skip to content</a><Header
  user={data.user}
  name={data.config.name}
  shortName={data.config.shortName}
/>
<main id="content">{@render children()}</main>
<BottomNav />
