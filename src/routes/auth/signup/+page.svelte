<script lang="ts">
  import { ArrowRight, ShieldCheck } from '@lucide/svelte';
  import Turnstile from '$components/Turnstile.svelte';
  let { data, form } = $props();
  const result = $derived(form as any);
</script>

<svelte:head
  ><title>Create account — {data.config.name}</title><meta
    name="robots"
    content="noindex"
  /></svelte:head
>
<div class="page shell">
  <section class="auth-card surface">
    <p class="eyebrow">Join the marketplace</p>
    <h1>Create your account</h1>
    <p class="muted">Start buying, selling and talking directly.</p>
    <form class="form-grid" method="POST">
      <div class="two-col">
        <div class="field">
          <label for="displayName">Display name</label><input
            class="input"
            id="displayName"
            name="displayName"
            value={result?.values?.displayName || ''}
            autocomplete="name"
            required
          />
        </div>
        <div class="field">
          <label for="handle">Handle</label><input
            class="input"
            id="handle"
            name="handle"
            value={result?.values?.handle || ''}
            pattern="[a-z0-9][a-z0-9-]+"
            minlength="3"
            maxlength="30"
            autocomplete="username"
            required
          /><span class="hint">Lowercase letters, numbers and hyphens.</span>
        </div>
      </div>
      <div class="field">
        <label for="email">Email</label><input
          class="input"
          id="email"
          name="email"
          value={result?.values?.email || ''}
          type="email"
          autocomplete="email"
          required
        />
      </div>
      <div class="field">
        <label for="password">Password</label><input
          class="input"
          id="password"
          name="password"
          type="password"
          minlength="12"
          maxlength="128"
          autocomplete="new-password"
          required
        /><span class="hint">12+ characters with upper, lower and a number.</span>
      </div>
      <div class="two-col">
        <div class="field">
          <label for="locality">Town / suburb</label><input
            class="input"
            id="locality"
            name="locality"
            value={result?.values?.locality || ''}
            autocomplete="address-level2"
            required
          />
        </div>
        <div class="field">
          <label for="region">Province / region</label><input
            class="input"
            id="region"
            name="region"
            value={result?.values?.region || ''}
            autocomplete="address-level1"
            required
          />
        </div>
      </div>
      <Turnstile siteKey={data.config.turnstileSiteKey} />{#if form?.message}<p
          class="alert"
          role="alert"
        >
          {form.message}
        </p>{/if}<button class="btn btn-primary" type="submit"
        >Create account <ArrowRight size={18} /></button
      >
    </form>
    <p class="terms">
      <ShieldCheck size={15} /> By continuing, you agree to the <a href="/legal/terms">Terms</a> and
      acknowledge the <a href="/legal/privacy">Privacy Notice</a>.
    </p>
    <hr class="divider" />
    <p class="center">Already registered? <a href="/auth/login">Sign in</a></p>
  </section>
</div>

<style>
  .auth-card h1 {
    font-size: clamp(2rem, 7vw, 3.2rem);
    margin-bottom: 0.7rem;
  }
  .terms {
    display: flex;
    gap: 0.4rem;
    color: var(--muted);
    font-size: 0.72rem;
    margin-top: 1rem;
  }
  .terms a,
  .center a {
    color: var(--green-deep);
    font-weight: 750;
  }
  .center {
    text-align: center;
    font-size: 0.86rem;
    margin: 0;
  }
</style>
