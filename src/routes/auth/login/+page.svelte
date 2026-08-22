<script lang="ts">
  import { ArrowRight } from '@lucide/svelte';
  import Turnstile from '$components/Turnstile.svelte';
  let { data, form } = $props();
</script>

<svelte:head
  ><title>Sign in — {data.config.name}</title><meta name="robots" content="noindex" /></svelte:head
>
<div class="page shell">
  <section class="auth-card surface">
    <p class="eyebrow">Welcome back</p>
    <h1>Sign in</h1>
    <p class="muted">Your listings, favourites and conversations are waiting.</p>
    <form class="form-grid" method="POST">
      <input
        type="hidden"
        name="returnTo"
        value={new URLSearchParams(typeof location === 'undefined' ? '' : location.search).get(
          'returnTo'
        ) || '/'}
      />
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
      <div class="field">
        <div class="row between">
          <label for="password">Password</label><a class="forgot" href="/auth/forgot"
            >Forgot password?</a
          >
        </div>
        <input
          class="input"
          id="password"
          name="password"
          type="password"
          autocomplete="current-password"
          required
        />
      </div>
      <Turnstile siteKey={data.config.turnstileSiteKey} />{#if form?.message}<p
          class="alert"
          role="alert"
        >
          {form.message}
        </p>{/if}<button class="btn btn-primary" type="submit"
        >Sign in <ArrowRight size={18} /></button
      >
    </form>
    <hr class="divider" />
    <p class="center">New here? <a href="/auth/signup">Create an account</a></p>
  </section>
</div>

<style>
  .auth-card h1 {
    font-size: clamp(2rem, 7vw, 3.2rem);
    margin-bottom: 0.7rem;
  }
  .forgot,
  .center a {
    color: var(--green-deep);
    font-size: 0.8rem;
    font-weight: 750;
  }
  .center {
    text-align: center;
    font-size: 0.86rem;
    margin: 0;
  }
</style>
