import { highlightMatch } from './utils';

test('highlightMatch returns text when filter is empty', () => {
  expect(highlightMatch('Hello', '')).toBe('Hello');
});

test('highlightMatch wraps matches', () => {
  expect(highlightMatch('Hello', 'he')).toBe('<span class="match-highlight">He</span>llo');
});
