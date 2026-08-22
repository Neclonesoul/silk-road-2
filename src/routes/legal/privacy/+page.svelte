<script lang="ts">
  let { data } = $props();
</script>

<svelte:head><title>Privacy notice — {data.config.name}</title></svelte:head>
<div class="page shell prose">
  <p class="eyebrow">Operator review required before launch</p>
  <h1>Privacy Notice</h1>
  <p class="alert">
    This production placeholder describes the application’s data design. The marketplace operator
    must obtain jurisdiction-specific legal review, insert its legal identity and effective date,
    and approve the final notice before public launch.
  </p>
  <h2>What the marketplace collects</h2>
  <p>
    Account email, public profile details, approximate location, listing content, uploaded
    photographs, favourites, conversations, reports, blocks, security events and limited technical
    request information needed to operate and protect the service.
  </p>
  <h2>What remains private</h2>
  <p>
    Password hashes, session tokens, reset and verification tokens, private email addresses, exact
    residential addresses and moderation-only metadata are not intentionally exposed through public
    pages.
  </p>
  <h2>Why data is used</h2>
  <p>
    To create accounts, publish listings, enable buyer–seller conversations, store preferences,
    prevent abuse, investigate reports, secure the service and meet lawful obligations.
  </p>
  <h2>Retention and deletion</h2>
  <p>
    The operator must define retention periods and a verified deletion process before launch.
    Security and moderation records may require a different retention period from public marketplace
    content.
  </p>
  <h2>Processors and international transfers</h2>
  <p>
    Cloudflare provides application, database and object-storage infrastructure. A configured
    transactional email provider processes verification and password-reset email. The operator must
    document processor terms and transfer safeguards.
  </p>
  <h2>Your choices</h2>
  <p>
    Users can edit public profile details, remove listings, unfavourite items, block users and
    request account assistance through <a href={`mailto:${data.config.supportEmail}`}
      >{data.config.supportEmail}</a
    >. Applicable law may provide further access, correction, objection or deletion rights.
  </p>
</div>
