import React from 'react';
import { render } from '@testing-library/react';
import { highlightMatch, addItem } from './utils';

test('highlightMatch returns text when filter is empty', () => {
  const { container } = render(<div>{highlightMatch('Hello', '')}</div>);
  expect(container.textContent).toBe('Hello');
});

test('highlightMatch wraps matches', () => {
  const { container } = render(<div>{highlightMatch('Hello', 'he')}</div>);
  const span = container.querySelector('.match-highlight');
  expect(span).toBeInTheDocument();
  expect(span.textContent).toBe('He');
});

test('addItem sorts and reports duplicates', () => {
  const result = addItem('wishlist', 'B', [], [{ id: '1', title: 'A' }]);
  expect(result.wishlist.map((i) => i.title)).toEqual(['A', 'B']);
  expect(result.duplicate).toBe(false);
  const dup = addItem('owned', 'a', [{ id: '2', title: 'A' }], []);
  expect(dup.duplicate).toBe(true);
});
