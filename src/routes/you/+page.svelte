<script lang="ts">
  import {
    Bell,
    ChevronRight,
    Heart,
    LogOut,
    MessageCircle,
    Package,
    ShieldCheck
  } from '@lucide/svelte';
  let { data, form } = $props();
  const profile = $derived(data.profile as any);
  const counts = $derived(
    Object.fromEntries((data.listingCounts as any[]).map((row) => [row.status, row.count]))
  );
</script>

<svelte:head
  ><title>Your account — {data.config.name}</title><meta
    name="robots"
    content="noindex"
  /></svelte:head
>
<div class="page shell">
  <div class="profile-head">
    <span>{profile.display_name.slice(0, 1)}</span>
    <div>
      <p class="eyebrow">@{profile.handle}</p>
      <h1>{profile.display_name}</h1>
      <p>
        {profile.locality}, {profile.region} · Member since {new Date(
          profile.created_at
        ).getFullYear()}
      </p>
    </div>
    {#if profile.email_verified}<em><ShieldCheck size={17} /> Verified</em>{/if}
  </div>
  <div class="dashboard">
    <section class="stack">
      <div class="surface stats">
        <a href="/you/listings"><b>{counts.active || 0}</b><span>Active</span></a><a
          href="/you/listings"><b>{counts.sold || 0}</b><span>Sold</span></a
        ><a href="/you/listings"><b>{counts.draft || 0}</b><span>Drafts</span></a>
      </div>
      <nav class="surface menu" aria-label="Account">
        <a href="/you/listings"
          ><Package /><span>My listings<small>Create and manage inventory</small></span
          ><ChevronRight /></a
        ><a href="/messages"
          ><MessageCircle /><span>Messages<small>Talk directly with buyers and sellers</small></span
          ><ChevronRight /></a
        ><a href="/favourites"
          ><Heart /><span>Favourites<small>Items you have saved</small></span><ChevronRight /></a
        ><a href="/notifications"
          ><Bell /><span>Notifications<small>{data.unread?.count || 0} unread</small></span
          ><ChevronRight /></a
        >
      </nav>
    </section>
    <section class="surface edit">
      <p class="eyebrow">Public seller profile</p>
      <h2>Edit profile</h2>
      <form class="form-grid" method="POST" action="?/profile">
        <div class="field">
          <label for="displayName">Display name</label><input
            class="input"
            id="displayName"
            name="displayName"
            value={profile.display_name}
          />
        </div>
        <div class="field">
          <label for="bio">Bio</label><textarea class="textarea" id="bio" name="bio" maxlength="500"
            >{profile.bio}</textarea
          >
        </div>
        <div class="two-col">
          <div class="field">
            <label for="locality">Town / suburb</label><input
              class="input"
              id="locality"
              name="locality"
              value={profile.locality}
            />
          </div>
          <div class="field">
            <label for="region">Province / region</label><input
              class="input"
              id="region"
              name="region"
              value={profile.region}
            />
          </div>
        </div>
        {#if form?.message}<p class="alert">{form.message}</p>{/if}{#if form?.success}<p
            class="alert success"
          >
            Profile updated.
          </p>{/if}<button class="btn btn-primary" type="submit">Save profile</button>
      </form>
      <hr class="divider" />
      <form method="POST" action="/auth/logout">
        <button class="btn btn-secondary logout" type="submit"><LogOut size={17} /> Sign out</button
        >
      </form>
    </section>
  </div>
</div>

<style>
  .profile-head {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 1rem;
    margin: 1rem 0 2rem;
  }
  .profile-head > span {
    width: 72px;
    height: 72px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--ink);
    color: var(--canvas);
    font-size: 2rem;
    font-weight: 850;
  }
  .profile-head h1,
  .profile-head p {
    margin: 0;
  }
  .profile-head h1 {
    font-size: clamp(2rem, 6vw, 3.5rem);
  }
  .profile-head p {
    color: var(--muted);
  }
  .profile-head em {
    grid-column: 2;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    color: var(--green-deep);
    font-size: 0.8rem;
    font-style: normal;
    font-weight: 750;
  }
  .dashboard {
    display: grid;
    gap: 1rem;
  }
  .stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    padding: 0.8rem;
  }
  .stats a {
    display: grid;
    justify-items: center;
    padding: 0.7rem;
    border-right: 1px solid var(--border);
  }
  .stats a:last-child {
    border: 0;
  }
  .stats b {
    font-size: 1.5rem;
  }
  .stats span {
    font-size: 0.75rem;
    color: var(--muted);
  }
  .menu {
    overflow: hidden;
  }
  .menu a {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem;
    border-bottom: 1px solid var(--border);
  }
  .menu a:last-child {
    border: 0;
  }
  .menu a > :global(svg):first-child {
    color: var(--green-deep);
  }
  .menu span {
    display: grid;
    font-weight: 750;
  }
  .menu small {
    color: var(--muted);
    font-size: 0.72rem;
    font-weight: 450;
  }
  .edit {
    padding: clamp(1rem, 3vw, 1.5rem);
  }
  .logout {
    width: 100%;
  }
  @media (min-width: 860px) {
    .profile-head {
      grid-template-columns: auto 1fr auto;
    }
    .profile-head em {
      grid-column: auto;
    }
    .dashboard {
      grid-template-columns: minmax(300px, 0.7fr) minmax(0, 1.3fr);
      align-items: start;
    }
  }
</style>
