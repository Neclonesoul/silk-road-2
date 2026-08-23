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
  const offers = $derived((data.offers || []) as any[]);
  const ownOffer = $derived(data.ownOffer as any);
  const isSeller = $derived(Boolean(data.user && data.user.id === listing.seller_id));
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

    {#if listing.price_negotiable}
      <section class="offers surface" id="offers">
        <p class="eyebrow">Direct negotiation</p>

        {#if isSeller}
          <h2>Buyer offers</h2>

          {#if form?.offerAccepted}
            <p class="offer-success">Offer accepted. This item is now reserved.</p>
          {:else if form?.offerDeclined}
            <p class="offer-success">Offer declined.</p>
          {/if}

          {#if offers.length}
            <div class="offer-list">
              {#each offers as offer}
                <article class="offer-row">
                  <div class="offer-copy">
                    <div class="offer-person">
                      <a href={`/sellers/${offer.buyer_handle}`}>
                        {offer.buyer_name}
                      </a>
                      <small>@{offer.buyer_handle}</small>
                    </div>

                    <strong>{formatMoney(offer.amount_cents)}</strong>

                    <span class:accepted={offer.status === 'accepted'} class="offer-status">
                      {offer.status}
                    </span>
                  </div>

                  {#if offer.status === 'pending' && listing.status === 'active'}
                    <div class="offer-actions">
                      <form method="POST" action="?/acceptOffer">
                        <input type="hidden" name="offerId" value={offer.id} />
                        <button class="btn btn-primary" type="submit"> Accept </button>
                      </form>

                      <form method="POST" action="?/declineOffer">
                        <input type="hidden" name="offerId" value={offer.id} />
                        <button class="btn btn-secondary" type="submit"> Decline </button>
                      </form>
                    </div>
                  {:else if offer.status === 'accepted'}
                    <p class="offer-note">
                      Accepted — finish the sale from My listings when the trade is complete.
                    </p>
                  {/if}
                </article>
              {/each}
            </div>
          {:else}
            <p class="offer-empty">
              No offers yet. Buyers can negotiate directly while this listing remains active.
            </p>
          {/if}
        {:else}
          <h2>Make an offer</h2>

          {#if form?.offerCreated}
            <p class="offer-success">Offer sent to the seller.</p>
          {:else if form?.offerWithdrawn}
            <p class="offer-success">Your offer was withdrawn.</p>
          {/if}

          {#if ownOffer?.status === 'pending'}
            <div class="buyer-offer">
              <div>
                <span>Your current offer</span>
                <strong>{formatMoney(ownOffer.amount_cents)}</strong>
                <small>Waiting for the seller</small>
              </div>

              <form method="POST" action="?/withdrawOffer">
                <input type="hidden" name="offerId" value={ownOffer.id} />
                <button class="btn btn-secondary" type="submit"> Withdraw offer </button>
              </form>
            </div>
          {:else if ownOffer?.status === 'accepted'}
            <div class="offer-success">
              <strong>Your offer was accepted.</strong>
              <span>The item is reserved while you complete the trade with the seller.</span>
            </div>
          {:else if listing.status === 'active'}
            {#if data.user}
              {#if ownOffer?.status === 'declined'}
                <p class="offer-history">
                  Your previous offer of {formatMoney(ownOffer.amount_cents)} was declined. You can make
                  another offer.
                </p>
              {:else if ownOffer?.status === 'withdrawn'}
                <p class="offer-history">
                  Your previous offer was withdrawn. You can make another offer.
                </p>
              {/if}

              <form class="offer-form" method="POST" action="?/makeOffer">
                <div class="offer-input">
                  <span>R</span>
                  <label class="sr-only" for="offer-amount">Offer amount</label>
                  <input
                    id="offer-amount"
                    name="amount"
                    type="number"
                    min="1"
                    step="0.01"
                    inputmode="decimal"
                    placeholder="Your offer"
                    required
                  />
                </div>

                <button class="btn btn-primary" type="submit"> Send offer </button>
              </form>

              <p class="offer-note">
                The seller can accept or decline. An accepted offer reserves the item; payment
                remains between buyer and seller.
              </p>
            {:else}
              <a class="btn btn-primary" href={`/auth/login?returnTo=/listings/${listing.slug}`}>
                Sign in to make an offer
              </a>
            {/if}
          {:else if listing.status === 'reserved'}
            <p class="offer-empty">This item is currently reserved.</p>
          {/if}
        {/if}
      </section>
    {/if}

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
  <div class="mobile-actions">
    {#if listing.price_negotiable && listing.status === 'active' && !isSeller}
      <a class="btn btn-secondary" href="#offers">Make offer</a>
    {/if}

    <form method="POST" action="?/contact">
      <button class="btn btn-primary" type="submit">Message seller</button>
    </form>
  </div>
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

  .offers {
    padding: clamp(1rem, 3vw, 1.6rem);
    scroll-margin-top: 90px;
  }

  .offers h2 {
    margin: 0.2rem 0 1rem;
  }

  .offer-list {
    display: grid;
    gap: 0.7rem;
  }

  .offer-row {
    display: grid;
    gap: 0.8rem;
    padding: 0.9rem;
    border: 1px solid var(--border);
    border-radius: 14px;
    background: var(--canvas);
  }

  .offer-copy {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.25rem 1rem;
  }

  .offer-person {
    min-width: 0;
    display: grid;
  }

  .offer-person a {
    font-weight: 800;
  }

  .offer-person small,
  .offer-note,
  .offer-history,
  .offer-empty {
    color: var(--muted);
  }

  .offer-copy > strong {
    grid-row: span 2;
    font-size: 1.25rem;
  }

  .offer-status {
    width: fit-content;
    padding: 0.18rem 0.5rem;
    border-radius: 999px;
    background: color-mix(in srgb, var(--muted) 12%, transparent);
    color: var(--muted);
    font-size: 0.67rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .offer-status.accepted {
    color: var(--green-deep);
    background: color-mix(in srgb, var(--green) 12%, transparent);
  }

  .offer-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .offer-actions form {
    flex: 1 1 120px;
  }

  .offer-actions button {
    width: 100%;
  }

  .offer-form {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.6rem;
    align-items: stretch;
  }

  .offer-input {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    border: 1px solid var(--border);
    border-radius: 14px;
    background: var(--canvas);
    overflow: hidden;
  }

  .offer-input span {
    padding-left: 0.9rem;
    color: var(--muted);
    font-weight: 800;
  }

  .offer-input input {
    min-width: 0;
    border: 0;
    padding: 0.85rem 0.7rem;
    background: transparent;
    color: var(--ink);
    font: inherit;
    outline: none;
  }

  .buyer-offer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 14px;
    background: var(--canvas);
  }

  .buyer-offer > div {
    display: grid;
  }

  .buyer-offer strong {
    font-size: 1.35rem;
  }

  .buyer-offer span,
  .buyer-offer small {
    color: var(--muted);
  }

  .offer-success {
    display: grid;
    gap: 0.2rem;
    padding: 0.8rem 0.9rem;
    border: 1px solid color-mix(in srgb, var(--green) 35%, var(--border));
    border-radius: 12px;
    background: color-mix(in srgb, var(--green) 8%, var(--paper));
    color: var(--green-deep);
  }

  .offer-note,
  .offer-history,
  .offer-empty {
    margin: 0.8rem 0 0;
    font-size: 0.78rem;
    line-height: 1.5;
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

  .mobile-actions {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }

  .mobile-actions form {
    margin: 0;
  }

  .mobile-actions .btn {
    white-space: nowrap;
  }

  @media (max-width: 520px) {
    .offer-form {
      grid-template-columns: 1fr;
    }

    .buyer-offer {
      align-items: stretch;
      flex-direction: column;
    }
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
