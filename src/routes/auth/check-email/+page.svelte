<script lang="ts">
  import { MailCheck } from '@lucide/svelte';
  let { data } = $props();
</script>

<svelte:head
  ><title>Check your email — {data.config.name}</title><meta
    name="robots"
    content="noindex"
  /></svelte:head
>
<div class="page shell">
  <section class="auth-card surface check">
    <MailCheck size={52} />
    <p class="eyebrow">One final step</p>
    <h1>Check your email</h1>
    <p>Open the verification link we sent you. It expires in 24 hours.</p>
    <a class="btn btn-primary" href="/">Explore marketplace</a>
    <p class="hint">
      Nothing arrived? Check spam, confirm your email in your profile, or contact {data.config
        .supportEmail}.
    </p>
  </section>
</div>

<style>
  .check {
    text-align: center;
    display: grid;
    justify-items: center;
    gap: 0.65rem;
  }
  .check :global(svg) {
    color: var(--gold);
  }
  .check h1 {
    font-size: clamp(2rem, 7vw, 3.2rem);
    margin: 0;
  }
  .check p {
    max-width: 42ch;
  }
</style>
