<script lang="ts">
  import { Flag, ShieldCheck } from '@lucide/svelte';
  let { data, form } = $props();
</script>

<svelte:head
  ><title>Report a concern — {data.config.name}</title><meta
    name="robots"
    content="noindex"
  /></svelte:head
>
<div class="page shell">
  <section class="auth-card surface">
    <Flag size={32} class="flag" />
    <p class="eyebrow">Marketplace safety</p>
    <h1>Report a concern</h1>
    {#if form?.success}<div class="alert success">
        <h2>Report received</h2>
        <p>
          A moderator can now inspect the relevant record and its audit trail. Thank you for helping
          keep trade safer.
        </p>
      </div>
      <a class="btn btn-primary" href="/">Return to marketplace</a>{:else}<p class="muted">
        Reports are reviewed by people. Explain what happened without including unnecessary private
        information.
      </p>
      <form class="form-grid" method="POST">
        <input type="hidden" name="targetType" value={data.targetType} /><input
          type="hidden"
          name="targetId"
          value={data.targetId}
        />
        <div class="field">
          <label for="reason">Reason</label><select
            class="select"
            id="reason"
            name="reason"
            required
            ><option value="">Choose a reason</option><option value="prohibited"
              >Prohibited item or content</option
            ><option value="fraud">Suspected fraud or scam</option><option value="misleading"
              >Misleading listing</option
            ><option value="abusive">Abusive behaviour</option><option value="duplicate"
              >Duplicate listing</option
            ><option value="other">Other</option></select
          >
        </div>
        <div class="field">
          <label for="detail">What should the moderator know?</label><textarea
            class="textarea"
            id="detail"
            name="detail"
            maxlength="1000"
            placeholder="Describe the issue clearly."
          ></textarea>
        </div>
        {#if form?.message}<p class="alert">{form.message}</p>{/if}<button
          class="btn btn-primary"
          type="submit">Submit report</button
        >
      </form>
      <p class="safety">
        <ShieldCheck size={15} /> If you are in immediate danger, contact local emergency services.
      </p>{/if}
  </section>
</div>

<style>
  .auth-card h1 {
    font-size: clamp(2rem, 7vw, 3.2rem);
  }
  .safety {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    color: var(--muted);
    font-size: 0.72rem;
    margin-top: 1rem;
  }
</style>
