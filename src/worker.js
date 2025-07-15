export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      const email = parseEmail(request.headers.get('cf-access-jwt-assertion'));
      if (!email) {
        return new Response('Unauthorized', { status: 401 });
      }
      if (request.method === 'GET' && url.pathname === '/api/collection') {
        return handleGetCollection(env.DB, email);
      }
      if (request.method === 'POST' && url.pathname === '/api/add') {
        return handleAdd(request, env.DB, email);
      }
      if (request.method === 'POST' && url.pathname === '/api/move') {
        return handleMove(request, env.DB, email);
      }
      if (request.method === 'POST' && url.pathname === '/api/import') {
        return handleImport(request, env.DB, email);
      }
      if (request.method === 'DELETE' && url.pathname.startsWith('/api/item/')) {
        const id = url.pathname.split('/').pop();
        return handleDelete(env.DB, email, id);
      }
      return new Response('Not Found', { status: 404 });
    }
    // fallback to static assets
    return env.ASSETS.fetch(request);
  },
};

function parseEmail(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json);
    return payload.email || payload.sub || null;
  } catch {
    return null;
  }
}

async function handleGetCollection(db, email) {
  const { results } = await db
    .prepare('SELECT id, title, owned FROM items WHERE user = ?')
    .bind(email)
    .all();
  const owned = [];
  const wishlist = [];
  for (const row of results) {
    const item = { id: row.id, title: row.title };
    if (row.owned) owned.push(item); else wishlist.push(item);
  }
  return json({ owned, wishlist });
}

async function handleAdd(request, db, email) {
  const { title, list } = await request.json();
  if (!title || !['owned', 'wishlist'].includes(list)) {
    return new Response('Bad Request', { status: 400 });
  }
  const id = crypto.randomUUID();
  await db
    .prepare('INSERT INTO items (id, title, owned, user) VALUES (?, ?, ?, ?)')
    .bind(id, title, list === 'owned' ? 1 : 0, email)
    .run();
  return json({ id, title });
}

async function handleMove(request, db, email) {
  const { id, to } = await request.json();
  if (!id || !['owned', 'wishlist'].includes(to)) {
    return new Response('Bad Request', { status: 400 });
  }
  await db
    .prepare('UPDATE items SET owned = ? WHERE id = ? AND user = ?')
    .bind(to === 'owned' ? 1 : 0, id, email)
    .run();
  return new Response(null, { status: 204 });
}

async function handleImport(request, db, email) {
  const { owned, wishlist } = await request.json();
  if (!Array.isArray(owned) || !Array.isArray(wishlist)) {
    return new Response('Bad Request', { status: 400 });
  }

  await db.prepare('DELETE FROM items WHERE user = ?').bind(email).run();

  const insert = db.prepare(
    'INSERT INTO items (id, title, owned, user) VALUES (?, ?, ?, ?)'
  );

  const savedOwned = [];
  const savedWishlist = [];

  for (const title of owned) {
    if (typeof title !== 'string' || !title) {
      return new Response('Bad Request', { status: 400 });
    }
    const id = crypto.randomUUID();
    await insert.bind(id, title, 1, email).run();
    savedOwned.push({ id, title });
  }

  for (const title of wishlist) {
    if (typeof title !== 'string' || !title) {
      return new Response('Bad Request', { status: 400 });
    }
    const id = crypto.randomUUID();
    await insert.bind(id, title, 0, email).run();
    savedWishlist.push({ id, title });
  }

  return json({ owned: savedOwned, wishlist: savedWishlist });
}

async function handleDelete(db, email, id) {
  if (!id) return new Response('Bad Request', { status: 400 });
  await db
    .prepare('DELETE FROM items WHERE id = ? AND user = ?')
    .bind(id, email)
    .run();
  return new Response(null, { status: 204 });
}

function json(data) {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}
