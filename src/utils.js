import React from 'react';

export function highlightMatch(text, filter) {
  if (!filter) return [text];
  const regex = new RegExp(
    `(${filter.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")})`,
    "gi"
  );
  return text.split(regex).map((part, idx) =>
    idx % 2 === 1
      ? React.createElement(
          "span",
          { key: idx, className: "match-highlight" },
          part
        )
      : part
  );
}

export function sortTitles(list) {
  return [...list].sort((a, b) => a.title.localeCompare(b.title));
}

export function addItem(list, title, owned, wishlist) {
  const normalized = title.toLowerCase();
  const duplicate =
    owned.some((t) => t.title.toLowerCase() === normalized) ||
    wishlist.some((t) => t.title.toLowerCase() === normalized);

  const item = { id: crypto.randomUUID(), title };

  if (list === 'wishlist') {
    return {
      owned: [...owned],
      wishlist: sortTitles([...wishlist, item]),
      duplicate,
    };
  }

  return {
    owned: sortTitles([...owned, item]),
    wishlist: [...wishlist],
    duplicate,
  };
}

export function getAccessUser() {
  const cookie = document.cookie
    .split('; ')
    .find((c) => c.startsWith('CF_Authorization='));
  if (!cookie) return null;
  const token = cookie.split('=')[1];
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    const payload = JSON.parse(json);
    return payload.email || payload.sub || null;
  } catch {
    return null;
  }
}
