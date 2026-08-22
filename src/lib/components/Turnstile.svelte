<script lang="ts">
  let { siteKey }: { siteKey: string } = $props();
</script>

<svelte:head
  ><script
    src="https://challenges.cloudflare.com/turnstile/v0/api.js"
    async
    defer
  ></script></svelte:head
>
{#if siteKey}<div class="cf-turnstile" data-sitekey={siteKey} data-theme="auto"></div>{:else}<input
    type="hidden"
    name="cf-turnstile-response"
    value="development"
  />{/if}
