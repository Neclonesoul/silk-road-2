<script lang="ts">
  let { data, form } = $props();
  const token =
    typeof location === 'undefined' ? '' : new URLSearchParams(location.search).get('token') || '';
</script>

<svelte:head
  ><title>Choose a new password — {data.config.name}</title><meta
    name="robots"
    content="noindex"
  /></svelte:head
>
<div class="page shell">
  <section class="auth-card surface">
    <p class="eyebrow">Account recovery</p>
    <h1>Choose a new password</h1>
    <form class="form-grid" method="POST">
      <input type="hidden" name="token" value={token} />
      <div class="field">
        <label for="password">New password</label><input
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
      {#if form?.message}<p class="alert">{form.message}</p>{/if}<button
        class="btn btn-primary"
        type="submit">Update password</button
      >
    </form>
  </section>
</div>

<style>
  .auth-card h1 {
    font-size: clamp(2rem, 7vw, 3.2rem);
  }
</style>
