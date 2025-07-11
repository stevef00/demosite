import { sortTitles, addItem as computeAddItem } from './utils';

const KEY = 'dvdData';

function normalize(list) {
  return (list || []).map((item) =>
    typeof item === 'string' ? { id: crypto.randomUUID(), title: item } : item
  );
}

function loadFromLocalStorage() {
  const cached = localStorage.getItem(KEY);
  if (!cached) return null;
  try {
    const parsed = JSON.parse(cached);
    const owned = sortTitles(normalize(parsed.owned));
    const wishlist = sortTitles(normalize(parsed.wishlist));
    saveToLocalStorage(owned, wishlist);
    return { owned, wishlist };
  } catch (err) {
    console.error('Failed to parse cached data', err);
    localStorage.removeItem(KEY);
    return null;
  }
}

function saveToLocalStorage(owned, wishlist) {
  localStorage.setItem(KEY, JSON.stringify({ owned, wishlist }));
}

export function loadCollection() {
  const loaded = loadFromLocalStorage();
  if (loaded) return loaded;
  const owned = [];
  const wishlist = [];
  saveToLocalStorage(owned, wishlist);
  return { owned, wishlist };
}

export function saveCollection(owned, wishlist) {
  saveToLocalStorage(owned, wishlist);
}

export function addItem(list, title, owned, wishlist) {
  const result = computeAddItem(list, title, owned, wishlist);
  saveToLocalStorage(result.owned, result.wishlist);
  return result;
}

export function moveItem(from, idx, owned, wishlist) {
  let newOwned = owned;
  let newWish = wishlist;
  if (from === 'wishlist') {
    const item = wishlist[idx];
    newWish = sortTitles(wishlist.filter((_, i) => i !== idx));
    newOwned = sortTitles([...owned, item]);
  } else {
    const item = owned[idx];
    newOwned = sortTitles(owned.filter((_, i) => i !== idx));
    newWish = sortTitles([...wishlist, item]);
  }
  saveToLocalStorage(newOwned, newWish);
  return { owned: newOwned, wishlist: newWish };
}

export function deleteItem(list, idx, owned, wishlist) {
  let newOwned = owned;
  let newWish = wishlist;
  if (list === 'wishlist') {
    newWish = wishlist.filter((_, i) => i !== idx);
  } else {
    newOwned = owned.filter((_, i) => i !== idx);
  }
  newOwned = sortTitles(newOwned);
  newWish = sortTitles(newWish);
  saveToLocalStorage(newOwned, newWish);
  return { owned: newOwned, wishlist: newWish };
}
