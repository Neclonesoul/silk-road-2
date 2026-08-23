<script lang="ts">
  import { Compass, Search, Plus, MessageCircle, UserRound } from '@lucide/svelte';

  let { unreadMessages = 0 } = $props<{ unreadMessages?: number }>();
</script>

<nav aria-label="Mobile navigation">
  <a href="/"><Compass /><span>Explore</span></a><a href="/search"><Search /><span>Search</span></a
  ><a class="sell" href="/sell"><span class="orb"><Plus /></span><span>Sell</span></a><a
    href="/messages"><MessageCircle /><span>Messages</span></a
  ><a href="/you"><UserRound /><span>You</span></a>
</nav>

<style>
  nav {
    position: fixed;
    z-index: 40;
    left: 0;
    right: 0;
    bottom: 0;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    padding: 0.45rem max(0.35rem, env(safe-area-inset-right))
      calc(0.4rem + env(safe-area-inset-bottom)) max(0.35rem, env(safe-area-inset-left));
    background: color-mix(in srgb, var(--paper) 96%, transparent);
    border-top: 1px solid var(--border);
    backdrop-filter: blur(18px);
  }
  a {
    min-height: 54px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.16rem;
    color: var(--muted);
    font-size: 0.66rem;
    font-weight: 700;
  }
  a :global(svg) {
    width: 21px;
  }
  .orb {
    width: 44px;
    height: 44px;
    margin-top: -23px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: white;
    background: var(--green);
    box-shadow: 0 7px 20px color-mix(in srgb, var(--green) 35%, transparent);
    border: 4px solid var(--paper);
  }
  .sell {
    color: var(--green-deep);
  }

  .message-icon {
    position: relative;
    display: grid;
    place-items: center;
  }

  .badge {
    position: absolute;
    top: -9px;
    right: -13px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    display: grid;
    place-items: center;
    border: 2px solid var(--paper);
    border-radius: 999px;
    background: var(--green);
    color: white;
    font-size: 0.58rem;
    line-height: 1;
    font-weight: 800;
  }
  @media (min-width: 820px) {
    nav {
      display: none;
    }
  }
</style>
