<script lang="ts">
  import { AlertTriangle, Shield, Users } from '@lucide/svelte';
  let { data, form } = $props();
</script>

<svelte:head
  ><title>Moderation — {data.config.name}</title><meta
    name="robots"
    content="noindex,nofollow"
  /></svelte:head
>
<div class="page shell">
  <div class="page-head">
    <div>
      <p class="eyebrow">Protected administration</p>
      <h1>Moderation</h1>
    </div>
    <Shield size={34} />
  </div>
  <div class="metrics">
    <div class="surface"><Users /><b>{data.counts?.users || 0}</b><span>Active users</span></div>
    <div class="surface">
      <Shield /><b>{data.counts?.listings || 0}</b><span>Active listings</span>
    </div>
    <div class="surface">
      <AlertTriangle /><b>{data.counts?.open_reports || 0}</b><span>Open reports</span>
    </div>
  </div>
  {#if form?.message}<p class="alert">{form.message}</p>{/if}
  <section class="admin-section">
    <h2>Open reports</h2>
    {#if data.reports.length}<div class="cards">
        {#each data.reports as report}<article class="surface">
            <div class="row between">
              <span class="status">{report.status}</span><small
                >{report.target_type} · {report.target_id}</small
              >
            </div>
            <h3>{report.reason}</h3>
            <p>{report.detail || 'No additional detail supplied.'}</p>
            <small>Reported by @{report.reporter_handle}</small>
            <form class="form-grid" method="POST" action="?/moderate">
              <input type="hidden" name="reportId" value={report.id} /><textarea
                class="textarea"
                name="note"
                maxlength="1000"
                placeholder="Resolution note"
              ></textarea>
              <div class="row">
                <button class="btn btn-primary" name="resolution" value="resolved">Resolve</button
                ><button class="btn btn-secondary" name="resolution" value="dismissed"
                  >Dismiss</button
                >
              </div>
            </form>
          </article>{/each}
      </div>{:else}<p class="muted">No reports need attention.</p>{/if}
  </section>
  <section class="admin-section">
    <h2>Recently removed listings</h2>
    {#if data.removedListings.length}<div class="surface table">
        {#each data.removedListings as listing}<a href={`/listings/${listing.slug}`}
            ><b>{listing.title}</b><span>@{listing.handle}</span><small
              >{listing.moderation_reason}</small
            ></a
          >{/each}
      </div>{:else}<p class="muted">No removed listings.</p>{/if}
  </section>
  <section class="admin-section">
    <h2>Recent users</h2>
    <div class="surface table">
      {#each data.users as user}<div>
          <b>{user.display_name}</b><span>@{user.handle}</span><small
            >{user.role} · {user.status}</small
          >
        </div>{/each}
    </div>
  </section>
</div>

<style>
  .metrics {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.7rem;
  }
  .metrics div {
    display: grid;
    justify-items: center;
    padding: 1rem;
    text-align: center;
  }
  .metrics :global(svg) {
    color: var(--gold);
  }
  .metrics b {
    font-size: 1.5rem;
  }
  .metrics span {
    color: var(--muted);
    font-size: 0.7rem;
  }
  .admin-section {
    margin-top: 2rem;
  }
  .cards {
    display: grid;
    gap: 0.8rem;
  }
  .cards article {
    padding: 1rem;
  }
  .cards article h3 {
    margin-top: 1rem;
  }
  .cards .textarea {
    min-height: 80px;
  }
  .table {
    overflow: hidden;
  }
  .table > a,
  .table > div {
    display: grid;
    gap: 0.2rem;
    padding: 0.8rem;
    border-bottom: 1px solid var(--border);
  }
  .table > *:last-child {
    border: 0;
  }
  .table span,
  .table small {
    color: var(--muted);
    font-size: 0.75rem;
  }
  @media (min-width: 760px) {
    .cards {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
