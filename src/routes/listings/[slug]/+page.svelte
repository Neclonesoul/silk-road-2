<script lang="ts">
  import {
    CheckCircle2,
    Clock3,
    Flag,
    MapPin,
    MessageCircle,
    Share2,
    ShieldCheck
  } from '@lucide/svelte';
  import { formatMoney, relativeTime } from '$lib/utils';
  import FavoriteButton from '$components/FavoriteButton.svelte';
  import ListingCard from '$components/ListingCard.svelte';
  let { data, form } = $props();
  let selected = $state(0);
  const listing = $derived(data.listing as any);
  const productJsonLd = $derived(
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: listing.title,
      description: listing.description,
      image: listing.images.map((image: any) => `${data.config.url}/media/${image.object_key}`),
      offers: {
        '@type': 'Offer',
        priceCurrency: 'ZAR',
        price: listing.price_cents / 100,
        availability:
          listing.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
        url: `${data.config.url}/listings/${listing.slug}`
      }
    }).replace(/</g, '\\u003c')
  );
  async function share() {
    if (navigator.share)
      await navigator.share({
        title: listing.title,
        text: `${formatMoney(listing.price_cents)} — ${listing.title}`,
        url: location.href
      });
    else await navigator.clipboard.writeText(location.href);
  }
</script>

<svelte:head
  ><title>{listing.title} — {data.config.name}</title><meta
    name="description"
    content={String(listing.description).slice(0, 155)}
  /><link rel="canonical" href={`${data.config.url}/listings/${listing.slug}`} /><meta
    property="og:type"
    content="product"
  /><meta property="og:title" content={listing.title} /><meta
    property="og:description"
    content={`${formatMoney(listing.price_cents)} · ${listing.locality}`}
  />{#if listing.images[0]}<meta
      property="og:image"
      content={`${data.config.url}/media/${listing.images[0].object_key}`}
    />{/if}{@html `<script type="application/ld+json">${productJsonLd}</${'script'}>`}</svelte:head
>
<div class="page shell">
  <div class="detail">
    <section class="gallery" aria-label="Listing photographs">
      {#if listing.images.length}<div class="hero surface">
          <img
            src={`/media/${listing.images[selected].object_key}`}
            alt={listing.images[selected].alt_text || listing.title}
            width="1200"
            height="900"
          />
        </div>
        {#if listing.images.length > 1}<div class="thumbs">
            {#each listing.images as image, index}<button
                class:active={selected === index}
                onclick={() => (selected = index)}
                aria-label={`View photograph ${index + 1}`}
                ><img src={`/media/${image.object_key}`} alt="" width="160" height="120" /></button
              >{/each}
          </div>{/if}{:else}<div class="hero placeholder surface">Photograph unavailable</div>{/if}
    </section>
    <aside class="summary surface">
      <div class="row between">
        <span class="status">{listing.status}</span>
        <div class="row">
          <FavoriteButton
            listingId={listing.id}
            initial={Boolean(listing.is_favorite)}
            signedIn={Boolean(data.user)}
          /><button class="icon-btn" onclick={share} aria-label="Share listing"
            ><Share2 size={19} /></button
          >
        </div>
      </div>
      <p class="price">
        {#if Number(listing.price_cents) === 0 && listing.price_negotiable}
          Make an offer
        {:else}
          {formatMoney(listing.price_cents)}
        {/if}
        {#if listing.price_negotiable}<small>Open to offers</small>{/if}
      </p>
      <h1>{listing.title}</h1>
      <div class="facts">
        <span><MapPin size={17} />{listing.locality}, {listing.region}</span>
        <span><Clock3 size={17} />{relativeTime(listing.published_at)}</span>
        <span>
          <CheckCircle2 size={17} />
          {String(listing.condition)
            .replace('-', ' ')
            .replace(/^./, (value) => value.toUpperCase())}
        </span>
      </div>
      {#if form?.message}<p class="alert">{form.message}</p>{/if}
      <form method="POST" action="?/contact">
        <button class="btn btn-primary contact" type="submit"
          ><MessageCircle size={19} /> Message seller</button
        >
      </form>
      <p class="privacy">
        <ShieldCheck size={16} /> Meet safely. Never send a deposit before verifying the item and seller.
      </p>
    </aside>
    <section class="description surface">
      <h2>About this item</h2>
      <p class="body">{listing.description}</p>
      {#if listing.attributes.length}<dl>
          {#each listing.attributes as attribute}<div>
              <dt>{attribute.label}</dt>
              <dd>
                {attribute.value_text ??
                  attribute.value_number ??
                  (attribute.value_boolean ? 'Yes' : 'No')}
              </dd>
            </div>{/each}
        </dl>{/if}
    </section>
    <section class="seller surface">
      <p class="eyebrow">Seller</p>
      <a class="seller-head" href={`/sellers/${listing.seller_handle}`}
        ><span class="avatar">{String(listing.seller_name).slice(0, 1)}</span><span
          ><h2>{listing.seller_name}</h2>
          <p>
            @{listing.seller_handle} · Member since {new Date(listing.seller_since).getFullYear()}
          </p></span
        ></a
      >
      <p>{listing.seller_bio || 'This seller has not added a bio yet.'}</p>
      {#if listing.seller_verified}<span class="verified"
          ><ShieldCheck size={16} /> Email verified</span
        >{/if}<a class="report" href={`/report?type=user&id=${listing.seller_id}`}
        ><Flag size={15} /> Report seller</a
      >
    </section>
  </div>
  {#if data.related.length}<section class="related">
      <h2>More like this</h2>
      <div class="listing-grid">
        {#each data.related as related}<ListingCard
            listing={related as any}
            signedIn={Boolean(data.user)}
          />{/each}
      </div>
    </section>{/if}
</div>
<div class="mobile-cta">
  <span>
    <b>
      {#if Number(listing.price_cents) === 0 && listing.price_negotiable}
        Make an offer
      {:else}
        {formatMoney(listing.price_cents)}
      {/if}
    </b>
    <small>{listing.status}</small>
  </span>
  <form method="POST" action="?/contact">
    <button class="btn btn-primary" type="submit">Message seller</button>
  </form>
</div>

<style>
  .detail {
    display: grid;
    gap: 1rem;
  }
  .gallery {
    min-width: 0;
  }
  .hero {
    aspect-ratio: 4/3;
    overflow: hidden;
    background: var(--paper);
  }
  .hero img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .placeholder {
    display: grid;
    place-items: center;
    color: var(--muted);
  }
  .thumbs {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding: 0.65rem 0;
  }
  .thumbs button {
    flex: 0 0 74px;
    aspect-ratio: 4/3;
    padding: 0;
    border: 2px solid transparent;
    border-radius: 10px;
    overflow: hidden;
    background: var(--paper);
    cursor: pointer;
  }
  .thumbs button.active {
    border-color: var(--green);
  }
  .thumbs img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .summary,
  .description,
  .seller {
    padding: clamp(1rem, 3vw, 1.6rem);
  }
  .summary h1 {
    font-size: clamp(1.6rem, 4vw, 2.5rem);
    line-height: 1.05;
    margin: 0.4rem 0 1rem;
  }
  .summary > .price {
    font-size: clamp(1.8rem, 6vw, 3rem);
    margin: 1rem 0 0.3rem;
  }
  .price small {
    font-size: 0.75rem;
    color: var(--muted);
    font-weight: 650;
  }
  .facts {
    display: grid;
    gap: 0.45rem;
    color: var(--muted);
    font-size: 0.86rem;
  }
  .facts span,
  .privacy,
  .verified,
  .report {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }
  .contact {
    width: 100%;
    margin-top: 1.2rem;
  }
  .privacy {
    margin: 1rem 0 0;
    color: var(--muted);
    font-size: 0.75rem;
  }
  .description .body {
    white-space: pre-wrap;
    max-width: 70ch;
  }
  dl {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.8rem;
    margin-top: 1.5rem;
  }
  dl div {
    padding: 0.75rem;
    border-radius: 10px;
    background: var(--canvas);
  }
  dt {
    font-size: 0.72rem;
    color: var(--muted);
  }
  dd {
    margin: 0;
    font-weight: 700;
  }
  .seller-head {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }
  .seller-head h2,
  .seller-head p {
    margin: 0;
  }
  .seller-head p {
    color: var(--muted);
    font-size: 0.78rem;
  }
  .avatar {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: var(--ink);
    color: var(--canvas);
    font-weight: 850;
    font-size: 1.3rem;
  }
  .verified {
    color: var(--green-deep);
    font-size: 0.8rem;
    font-weight: 700;
  }
  .report {
    margin-top: 1rem;
    color: var(--muted);
    font-size: 0.78rem;
  }
  .related {
    margin-top: 2.5rem;
  }
  .mobile-cta {
    position: fixed;
    z-index: 35;
    left: 0;
    right: 0;
    bottom: 68px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.65rem 1rem;
    background: var(--paper);
    border-top: 1px solid var(--border);
  }
  .mobile-cta span {
    display: grid;
  }
  .mobile-cta small {
    color: var(--muted);
    text-transform: capitalize;
  }
  @media (min-width: 820px) {
    .detail {
      grid-template-columns: minmax(0, 1.5fr) minmax(310px, 0.75fr);
    }
    .gallery {
      grid-row: span 1;
    }
    .summary {
      position: sticky;
      top: 88px;
      align-self: start;
    }
    .description {
      grid-column: 1;
    }
    .seller {
      grid-column: 2;
    }
    .mobile-cta {
      display: none;
    }
  }
  @media (max-width: 819px) {
    .page {
      padding-bottom: 11rem;
    }
  }
</style>
