<script lang="ts">
  import {
    ArrowLeft,
    ArrowRight,
    Camera,
    CheckCircle2,
    GripVertical,
    Star,
    Trash2,
    Upload
  } from '@lucide/svelte';
  let { data, form } = $props();
  const listing = $derived(data.listing as any);
  const attributes = $derived(data.attributes as any[]);
  let images = $state<any[]>([]);
  let uploading = $state(false);
  let progress = $state(0);
  let notice = $state('');
  let attrValues = $state<Record<string, string | number | boolean>>({});
  $effect.pre(() => {
    images = [...data.images];
    attrValues = Object.fromEntries(attributes.map((a: any) => [a.attribute_key, '']));
  });
  function uploadOne(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const fd = new FormData();
      fd.set('image', file);
      xhr.open('POST', `/api/listings/${listing.id}/images`);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) progress = Math.round((event.loaded / event.total) * 100);
      };
      xhr.onload = () =>
        xhr.status < 300
          ? resolve(JSON.parse(xhr.responseText))
          : reject(new Error(xhr.responseText));
      xhr.onerror = () => reject(new Error('Upload failed'));
      xhr.send(fd);
    });
  }
  async function upload(event: Event) {
    const files = Array.from((event.currentTarget as HTMLInputElement).files || []);
    if (!files.length) return;
    uploading = true;
    notice = '';
    try {
      for (const file of files) {
        const image = await uploadOne(file);
        images = [
          ...images,
          {
            id: image.id,
            object_key: image.url.replace('/media/', ''),
            is_cover: images.length ? 0 : 1,
            sort_order: images.length
          }
        ];
      }
      notice = 'Photographs uploaded.';
    } catch {
      notice = 'One photograph could not be uploaded. Check its format and size.';
    } finally {
      uploading = false;
      progress = 0;
      (event.currentTarget as HTMLInputElement).value = '';
    }
  }
  async function remove(id: string) {
    const response = await fetch(`/api/listings/${listing.id}/images/${id}`, { method: 'DELETE' });
    if (response.ok) images = images.filter((image) => image.id !== id);
  }
  async function makeCover(id: string) {
    images = images.map((image) => ({ ...image, is_cover: image.id === id ? 1 : 0 }));
    await saveOrder();
  }
  async function move(index: number, direction: number) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    [images[index], images[target]] = [images[target], images[index]];
    images = [...images];
    await saveOrder();
  }
  async function saveOrder() {
    await fetch(`/api/listings/${listing.id}/images`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        order: images.map((image) => image.id),
        coverId: (images.find((image) => image.is_cover) || images[0])?.id
      })
    });
  }
  function setAttribute(key: string, value: string) {
    attrValues[key] = value;
    attrValues = { ...attrValues };
  }
</script>

<svelte:head
  ><title>Edit {listing.title} — {data.config.name}</title><meta
    name="robots"
    content="noindex"
  /></svelte:head
>
<div class="page shell">
  <a class="back" href="/you/listings"><ArrowLeft size={17} /> My listings</a>
  <div class="page-head">
    <div>
      <p class="eyebrow">Listing studio</p>
      <h1>{listing.title}</h1>
    </div>
    <span class="status">{listing.status}</span>
  </div>
  <div class="editor">
    <form class="surface details" method="POST" action="?/save">
      <h2>Details</h2>
      <div class="field">
        <label for="title">Title</label><input
          class="input"
          id="title"
          name="title"
          maxlength="100"
          value={listing.title}
          required
        />
      </div>
      <div class="field">
        <label for="description">Description</label><textarea
          class="textarea"
          id="description"
          name="description"
          maxlength="5000"
          required>{listing.description}</textarea
        ><span class="hint">Describe condition, what's included and any defects honestly.</span>
      </div>
      <div class="two-col">
        <div class="field">
          <label for="category">Category</label><select
            class="select"
            id="category"
            name="categoryId"
            >{#each data.categories as category}<option
                value={category.id}
                selected={listing.category_id === category.id}>{category.name}</option
              >{/each}</select
          >
        </div>
        <div class="field">
          <label for="condition">Condition</label><select
            class="select"
            id="condition"
            name="condition"
            >{#each ['new', 'like-new', 'good', 'fair', 'parts'] as condition}<option
                value={condition}
                selected={listing.condition === condition}>{condition.replace('-', ' ')}</option
              >{/each}</select
          >
        </div>
      </div>
      <div class="two-col">
        <div class="field">
          <label for="price">Price (R)</label><input
            class="input"
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={listing.price_cents / 100}
            required
          />
        </div>
        <label class="check"
          ><input
            type="checkbox"
            name="priceNegotiable"
            checked={Boolean(listing.price_negotiable)}
          /> Open to offers</label
        >
      </div>
      <div class="two-col">
        <div class="field">
          <label for="locality">Town / suburb</label><input
            class="input"
            id="locality"
            name="locality"
            value={listing.locality}
            required
          />
        </div>
        <div class="field">
          <label for="region">Province / region</label><input
            class="input"
            id="region"
            name="region"
            value={listing.region}
            required
          />
        </div>
      </div>
      {#if attributes.length}<hr class="divider" />
        <h3>Category details</h3>
        {#each attributes as attribute}<div class="field">
            <label for={`attr-${attribute.attribute_key}`}
              >{attribute.label}{attribute.required ? ' *' : ''}</label
            >{#if attribute.field_type === 'select'}<select
                class="select"
                id={`attr-${attribute.attribute_key}`}
                value={String(attrValues[attribute.attribute_key] || '')}
                onchange={(event) =>
                  setAttribute(attribute.attribute_key, event.currentTarget.value)}
                >{#each JSON.parse(attribute.options_json || '[]') as option}<option value={option}
                    >{option}</option
                  >{/each}</select
              >{:else if attribute.field_type === 'boolean'}<select
                class="select"
                id={`attr-${attribute.attribute_key}`}
                value={String(attrValues[attribute.attribute_key] || '')}
                onchange={(event) =>
                  setAttribute(attribute.attribute_key, event.currentTarget.value)}
                ><option value="">Choose</option><option value="true">Yes</option><option
                  value="false">No</option
                ></select
              >{:else}<input
                class="input"
                id={`attr-${attribute.attribute_key}`}
                type={attribute.field_type === 'number' ? 'number' : 'text'}
                value={String(attrValues[attribute.attribute_key] || '')}
                oninput={(event) =>
                  setAttribute(attribute.attribute_key, event.currentTarget.value)}
              />{/if}
          </div>{/each}<input
          type="hidden"
          name="attributes"
          value={JSON.stringify(attrValues)}
        />{:else}<input type="hidden" name="attributes" value={'{}'} />{/if}{#if form?.message}<p
          class="alert"
        >
          {form.message}
        </p>{/if}{#if form?.saved}<p class="alert success">
          <CheckCircle2 size={18} /> Draft saved.
        </p>{/if}<button class="btn btn-secondary" type="submit">Save draft</button>
    </form>
    <aside class="stack">
      <section class="surface photos">
        <div class="row between">
          <div>
            <p class="eyebrow">1–12 images</p>
            <h2>Photographs</h2>
          </div>
          <Camera />
        </div>
        <label class="drop"
          ><input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            onchange={upload}
            disabled={uploading}
          /><Upload /><b>{uploading ? `Uploading ${progress}%` : 'Add photographs'}</b><small
            >JPEG, PNG, WebP or AVIF · 10 MB each</small
          ></label
        >{#if notice}<p class="hint" aria-live="polite">{notice}</p>{/if}{#if images.length}<div
            class="photo-list"
          >
            {#each images as image, index}<div class="photo">
                <img src={`/media/${image.object_key}`} alt="" /><span
                  >{image.is_cover ? 'Cover' : `Photo ${index + 1}`}</span
                >
                <div class="photo-actions">
                  <button
                    type="button"
                    onclick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label="Move earlier"><ArrowLeft size={15} /></button
                  ><button
                    type="button"
                    onclick={() => move(index, 1)}
                    disabled={index === images.length - 1}
                    aria-label="Move later"><ArrowRight size={15} /></button
                  ><button
                    class:cover={image.is_cover}
                    type="button"
                    onclick={() => makeCover(image.id)}
                    aria-label="Make cover"><Star size={15} /></button
                  ><button
                    type="button"
                    onclick={() => remove(image.id)}
                    aria-label="Remove photograph"><Trash2 size={15} /></button
                  >
                </div>
                <GripVertical class="grip" size={18} />
              </div>{/each}
          </div>{/if}
      </section>
      <section class="surface publish">
        <p class="eyebrow">Final check</p>
        <h2>Ready to meet buyers?</h2>
        <p>Save your details, choose a cover photo, then publish.</p>
        <form method="POST" action="?/publish">
          <button class="btn btn-primary" type="submit" disabled={!images.length}
            >Publish listing</button
          >
        </form>
        {#if !images.length}<span class="hint">One photograph is required.</span>{/if}
      </section>
    </aside>
  </div>
</div>

<style>
  .back {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    color: var(--muted);
    font-size: 0.85rem;
  }
  .page-head h1 {
    font-size: clamp(2rem, 5vw, 3.5rem);
    margin: 0;
  }
  .editor {
    display: grid;
    gap: 1rem;
  }
  .details,
  .photos,
  .publish {
    padding: clamp(1rem, 3vw, 1.5rem);
  }
  .details {
    display: grid;
    gap: 1rem;
  }
  .check {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    align-self: end;
    min-height: 50px;
    font-weight: 700;
  }
  .check input {
    width: 19px;
    height: 19px;
  }
  .drop {
    position: relative;
    min-height: 150px;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 0.35rem;
    border: 1.5px dashed var(--border);
    border-radius: 14px;
    color: var(--muted);
    cursor: pointer;
  }
  .drop:hover {
    border-color: var(--green);
    color: var(--green-deep);
  }
  .drop input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }
  .drop small {
    font-size: 0.72rem;
  }
  .photo-list {
    display: grid;
    gap: 0.5rem;
    margin-top: 1rem;
  }
  .photo {
    position: relative;
    display: grid;
    grid-template-columns: 72px 1fr auto;
    align-items: center;
    gap: 0.7rem;
    padding: 0.45rem;
    border: 1px solid var(--border);
    border-radius: 12px;
  }
  .photo img {
    width: 72px;
    aspect-ratio: 4/3;
    object-fit: cover;
    border-radius: 8px;
  }
  .photo span {
    font-size: 0.8rem;
    font-weight: 700;
  }
  .photo-actions {
    display: flex;
    gap: 0.25rem;
  }
  .photo-actions button {
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--paper);
    color: var(--muted);
    cursor: pointer;
  }
  .photo-actions button.cover {
    color: var(--gold);
  }
  .publish p {
    color: var(--muted);
  }
  .publish .btn {
    width: 100%;
  }
  .alert.success {
    display: flex;
    gap: 0.4rem;
    align-items: center;
  }
  @media (min-width: 900px) {
    .editor {
      grid-template-columns: minmax(0, 1.35fr) minmax(330px, 0.65fr);
      align-items: start;
    }
    .stack {
      position: sticky;
      top: 88px;
    }
  }
</style>
