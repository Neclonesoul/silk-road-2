<script lang="ts">
  import { Mail } from '@lucide/svelte';
  import Turnstile from '$components/Turnstile.svelte';
  let { data, form } = $props();
</script>

<svelte:head
  ><title>Reset password — {data.config.name}</title><meta
    name="robots"
    content="noindex"
  /></svelte:head
>
<div class="page shell">
  <section class="auth-card surface">
    <Mail size={32} class="mail" />
    <p class="eyebrow">Account recovery</p>
    <h1>Reset your password</h1>
    {#if form?.success}<div class="alert success">
        <h2>Check your email</h2>
        <p>If an active account matches that address, a reset link is on its way.</p>
      </div>{:else}<p class="muted">
        Enter your account email. We’ll send a one-hour reset link if it matches an active account.
      </p>
      <form class="form-grid" method="POST">
        <div class="field">
          <label for="email">Email</label><input
            class="input"
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
          />
        </div>
        <Turnstile siteKey={data.config.turnstileSiteKey} />{#if form?.message}<p class="alert">
            {form.message}
          </p>{/if}<button class="btn btn-primary" type="submit">Send reset link</button>
      </form>{/if}
    <hr class="divider" />
    <a class="back" href="/auth/login">Back to sign in</a>
  </section>
</div>

<style>
  .auth-card h1 {
    font-size: clamp(2rem, 7vw, 3.2rem);
  }
  .back {
    display: block;
    text-align: center;
    color: var(--green-deep);
    font-weight: 750;
  }
</style>
