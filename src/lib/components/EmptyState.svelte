<script lang="ts">
  import { PackageOpen } from '@lucide/svelte';
  let {
    title,
    copy,
    action = '',
    href = ''
  }: { title: string; copy: string; action?: string; href?: string } = $props();
</script>

<div class="empty">
  <PackageOpen size={54} strokeWidth={1.4} />
  <h2>{title}</h2>
  <p>{copy}</p>
  {#if action && href}<a class="btn btn-primary" {href}>{action}</a>{/if}
</div>
