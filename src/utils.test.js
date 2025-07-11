import { highlightMatch, addItem } from './utils';

test('highlightMatch returns text when filter is empty', () => {
  expect(highlightMatch('Hello', '')).toBe('Hello');
});

test('highlightMatch wraps matches', () => {
  expect(highlightMatch('Hello', 'he')).toBe('<span class="match-highlight">He</span>llo');
});

test('addItem sorts and reports duplicates', () => {
  const result = addItem('wishlist', 'B', [], [{ id: '1', title: 'A' }]);
  expect(result.wishlist.map((i) => i.title)).toEqual(['A', 'B']);
  expect(result.duplicate).toBe(false);
  const dup = addItem('owned', 'a', [{ id: '2', title: 'A' }], []);
  expect(dup.duplicate).toBe(true);
});
