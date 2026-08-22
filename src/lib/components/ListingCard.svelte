<script lang="ts">
  import type { ListingCard as Card } from '$lib/types';
  import { formatMoney, relativeTime } from '$lib/utils';
  import FavoriteButton from './FavoriteButton.svelte';
  import ListingPlaceholder from './ListingPlaceholder.svelte';
  let { listing, signedIn = false }: { listing: Card; signedIn?: boolean } = $props();
</script>

<article>
  <a class="image" href={`/listings/${listing.slug}`}
    >{#if listing.coverKey}<img
        src={`/media/${listing.coverKey}`}
        alt=""
        loading="lazy"
        width="640"
        height="480"
      />{:else}<ListingPlaceholder />{/if}<span class="fav"
      ><FavoriteButton listingId={listing.id} initial={listing.isFavorite} {signedIn} /></span
    >{#if listing.status === 'reserved'}<em>Reserved</em>{/if}</a
  ><a class="copy" href={`/listings/${listing.slug}`}
    ><strong class="price">{formatMoney(listing.priceCents)}</strong>
    <h3>{listing.title}</h3>
    <p>{listing.locality} · {relativeTime(listing.publishedAt)}</p>
    <small>{listing.sellerVerified ? 'Verified seller' : listing.sellerName}</small></a
  >
</article>

<style>
  article {
    min-width: 0;
    background: var(--paper);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    transition:
      transform 0.18s ease,
      box-shadow 0.18s ease;
  }
  article:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow);
  }
  .image {
    position: relative;
    display: block;
    aspect-ratio: 4/3;
    background: var(--canvas);
    overflow: hidden;
  }
  .image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.25s ease;
  }
  .image:hover img {
    transform: scale(1.025);
  }
  .fav {
    position: absolute;
    top: 0.55rem;
    right: 0.55rem;
  }
  em {
    position: absolute;
    left: 0.55rem;
    bottom: 0.55rem;
    background: var(--ink);
    color: var(--canvas);
    padding: 0.28rem 0.55rem;
    border-radius: 999px;
    font-size: 0.7rem;
    font-style: normal;
    font-weight: 750;
  }
  .copy {
    display: grid;
    gap: 0.15rem;
    padding: 0.72rem;
  }
  .price {
    line-height: 1.1;
  }
  h3 {
    margin: 0.15rem 0 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  p {
    margin: 0;
    color: var(--muted);
    font-size: 0.75rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  small {
    margin-top: 0.2rem;
    color: var(--green-deep);
    font-size: 0.7rem;
    font-weight: 700;
  }
  @media (max-width: 420px) {
    .copy {
      padding: 0.62rem;
    }
    .price {
      font-size: 1.05rem;
    }
    h3 {
      font-size: 0.9rem;
    }
  }
</style>
