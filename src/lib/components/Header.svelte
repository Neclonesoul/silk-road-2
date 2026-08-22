<script lang="ts">
  import { Bell, Heart, MessageCircle, Plus } from '@lucide/svelte';
  import Logo from './Logo.svelte';
  import ThemeToggle from './ThemeToggle.svelte';
  import type { SessionUser } from '$lib/types';
  let { user, name, shortName }: { user: SessionUser | null; name: string; shortName: string } =
    $props();
</script>

<header>
  <div class="shell bar">
    <Logo {name} {shortName} />
    <nav aria-label="Primary">
      <a href="/">Explore</a><a href="/search">Search</a><a href="/favourites"
        ><Heart size={18} /> <span>Favourites</span></a
      ><a href="/messages"><MessageCircle size={18} /> <span>Messages</span></a>
    </nav>
    <div class="actions">
      <ThemeToggle />{#if user}<a class="icon-btn" href="/notifications" aria-label="Notifications"
          ><Bell size={19} /></a
        ><a class="profile" href="/you" aria-label="Your account"
          >{user.displayName.slice(0, 1).toUpperCase()}</a
        >{:else}<a class="signin" href="/auth/login">Sign in</a>{/if}<a
        class="btn btn-primary sell"
        href="/sell"><Plus size={18} /> Sell</a
      >
    </div>
  </div>
</header>

<style>
  header {
    position: sticky;
    top: 0;
    z-index: 30;
    background: color-mix(in srgb, var(--canvas) 92%, transparent);
    border-bottom: 1px solid var(--border);
    backdrop-filter: blur(16px);
  }
  .bar {
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }
  nav {
    display: none;
    align-items: center;
    gap: 1.35rem;
    font-size: 0.9rem;
    font-weight: 650;
  }
  nav a {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--muted);
  }
  nav a:hover {
    color: var(--ink);
  }
  .actions {
    display: flex;
    align-items: center;
    gap: 0.55rem;
  }
  .profile {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: var(--ink);
    color: var(--canvas);
    font-weight: 800;
  }
  .signin {
    font-weight: 700;
    font-size: 0.9rem;
  }
  .sell {
    display: none;
  }
  @media (min-width: 820px) {
    nav {
      display: flex;
    }
    .sell {
      display: inline-flex;
    }
  }
  @media (max-width: 420px) {
    .actions :global(.icon-btn) {
      display: none;
    }
  }
</style>
