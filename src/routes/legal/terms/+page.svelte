<script lang="ts">
  let { data } = $props();
</script>

<svelte:head><title>Terms of use — {data.config.name}</title></svelte:head>
<div class="page shell prose">
  <p class="eyebrow">Operator review required before launch</p>
  <h1>Terms of Use</h1>
  <p class="alert">
    This is an operational placeholder, not final legal advice. The marketplace operator must
    approve jurisdiction-specific terms, prohibited-items rules, consumer disclosures and dispute
    procedures before public launch.
  </p>
  <h2>The service</h2>
  <p>
    {data.config.name} connects buyers and sellers so they can discover items and talk directly. Unless
    the final terms say otherwise, the marketplace is not the seller, buyer, payment provider, delivery
    provider or agent in user transactions.
  </p>
  <h2>User responsibilities</h2>
  <ul>
    <li>Provide accurate account and listing information.</li>
    <li>Only list items you are legally entitled to sell.</li>
    <li>Do not misrepresent condition, price, ownership, location or availability.</li>
    <li>Do not harass users, evade blocks or misuse personal information.</li>
    <li>Keep credentials secure and report suspected compromise promptly.</li>
  </ul>
  <h2>Safety</h2>
  <p>
    Inspect goods before payment where practical, meet in a safe public place, avoid advance-payment
    pressure and report suspicious behaviour. The operator must publish escalation and
    law-enforcement processes before launch.
  </p>
  <h2>Moderation</h2>
  <p>
    The operator may review reports, remove content and suspend accounts under documented rules.
    Server-side audit events support accountable moderation; automated moderation is not claimed.
  </p>
  <h2>Liability and disputes</h2>
  <p>
    The operator must insert lawful limitations, warranties, governing law, dispute forum and
    consumer protections after professional legal review.
  </p>
</div>
