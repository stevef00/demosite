import { sortTitles } from './utils';

export async function loadCollection() {
  const res = await fetch('/api/collection');
  if (!res.ok) throw new Error('Failed to load collection');
  const data = await res.json();
  return {
    owned: sortTitles(data.owned || []),
    wishlist: sortTitles(data.wishlist || []),
  };
}

export async function addItem(list, title, owned, wishlist) {
  const resp = await fetch('/api/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ list, title }),
  });
  if (!resp.ok) throw new Error('Failed to add item');
  const { id } = await resp.json();

  const normalized = title.toLowerCase();
  const duplicate =
    owned.some((t) => t.title.toLowerCase() === normalized) ||
    wishlist.some((t) => t.title.toLowerCase() === normalized);

  const item = { id, title };
  let newOwned = owned;
  let newWish = wishlist;
  if (list === 'wishlist') {
    newWish = sortTitles([...wishlist, item]);
  } else {
    newOwned = sortTitles([...owned, item]);
  }

  return { owned: newOwned, wishlist: newWish, duplicate };
}

export async function moveItem(from, idx, owned, wishlist) {
  const item = from === 'wishlist' ? wishlist[idx] : owned[idx];
  const to = from === 'wishlist' ? 'owned' : 'wishlist';

  const resp = await fetch('/api/move', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: item.id, to }),
  });
  if (!resp.ok) throw new Error('Failed to move item');

  let newOwned = owned;
  let newWish = wishlist;
  if (from === 'wishlist') {
    newWish = sortTitles(wishlist.filter((_, i) => i !== idx));
    newOwned = sortTitles([...owned, item]);
  } else {
    newOwned = sortTitles(owned.filter((_, i) => i !== idx));
    newWish = sortTitles([...wishlist, item]);
  }

  return { owned: newOwned, wishlist: newWish };
}

export async function deleteItem(list, idx, owned, wishlist) {
  const item = list === 'wishlist' ? wishlist[idx] : owned[idx];

  const resp = await fetch(`/api/item/${item.id}`, { method: 'DELETE' });
  if (!resp.ok) throw new Error('Failed to delete item');

  let newOwned = owned;
  let newWish = wishlist;
  if (list === 'wishlist') {
    newWish = wishlist.filter((_, i) => i !== idx);
  } else {
    newOwned = owned.filter((_, i) => i !== idx);
  }

  return { owned: sortTitles(newOwned), wishlist: sortTitles(newWish) };
}
