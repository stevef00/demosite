import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  localStorage.clear();
});

test('moving a wishlist item shows confirmation and moves item after confirming', async () => {
  localStorage.setItem('dvdData', JSON.stringify({ owned: [], wishlist: ['Movie'] }));
  const { findByText, queryByText, getAllByLabelText } = render(<App />);

  // wait for item to appear from localStorage
  await findByText('Movie');

  fireEvent.click(getAllByLabelText('Move')[0]);
  expect(screen.getByText('Move this title to owned?')).toBeInTheDocument();

  fireEvent.click(screen.getByText('Yes'));

  await findByText('Movie');
  expect(screen.queryByText('Move this title to owned?')).toBeNull();

  // item should now be under Owned section and not under Wishlist
  const ownedItems = document.querySelectorAll('.owned-item');
  expect(ownedItems.length).toBe(1);
  expect(queryByText('Movie')).not.toBeNull();
  const wishlistItems = document.querySelectorAll('.wishlist-item');
  expect(wishlistItems.length).toBe(0);
});

test('deleting a wishlist item confirms and removes it', async () => {
  localStorage.setItem('dvdData', JSON.stringify({ owned: [], wishlist: ['Trash'] }));
  const { findByText, queryByText, getAllByLabelText } = render(<App />);

  await findByText('Trash');

  fireEvent.click(getAllByLabelText('Delete')[0]);
  expect(screen.getByText('Are you sure you want to delete this title?')).toBeInTheDocument();

  fireEvent.click(screen.getByText('Yes'));

  await new Promise(r => setTimeout(r, 0));
  expect(queryByText('Trash')).toBeNull();
});
