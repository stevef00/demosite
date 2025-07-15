import { loadCollection, addItem, moveItem, deleteItem } from './storage';

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  global.fetch.mockRestore && global.fetch.mockRestore();
  delete global.fetch;
});

test('loadCollection requests collection from API', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ owned: [], wishlist: [] })
  });

  const data = await loadCollection();

  expect(global.fetch).toHaveBeenCalledWith('/api/collection');
  expect(data).toEqual({ owned: [], wishlist: [] });
});

test('addItem posts to /api/add and sorts results', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ id: '3', title: 'C' })
  });

  const result = await addItem('owned', 'C', [{ id: '2', title: 'B' }], [ { id: '1', title: 'A' }]);

  expect(global.fetch).toHaveBeenCalledWith('/api/add', expect.objectContaining({ method: 'POST' }));
  expect(result.owned.map(i => i.title)).toEqual(['B', 'C']);
});

test('moveItem posts to /api/move', async () => {
  global.fetch.mockResolvedValueOnce({ ok: true });

  const result = await moveItem('wishlist', 0, [], [{ id: '1', title: 'A' }]);

  expect(global.fetch).toHaveBeenCalledWith('/api/move', expect.objectContaining({ method: 'POST' }));
  expect(result.owned.map(i => i.title)).toEqual(['A']);
  expect(result.wishlist).toEqual([]);
});

test('deleteItem calls DELETE endpoint', async () => {
  global.fetch.mockResolvedValueOnce({ ok: true });

  const result = await deleteItem('owned', 0, [{ id: '1', title: 'A' }], []);

  expect(global.fetch).toHaveBeenCalledWith('/api/item/1', { method: 'DELETE' });
  expect(result.owned).toEqual([]);
});
