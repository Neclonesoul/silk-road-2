<script lang="ts">
  import { Moon, Sun } from '@lucide/svelte';
  let dark = $state(false);
  function toggle() {
    dark = !dark;
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('silk-theme', dark ? 'dark' : 'light');
  }
  $effect(() => {
    dark = document.documentElement.dataset.theme === 'dark';
  });
</script>

<button
  class="icon-btn"
  type="button"
  onclick={toggle}
  aria-label={dark ? 'Use light theme' : 'Use dark theme'}
  >{#if dark}<Sun size={19} />{:else}<Moon size={19} />{/if}</button
>
