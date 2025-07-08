import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders heading', () => {
  render(<App />);
  expect(screen.getByText(/DVD Collection Tracker/i)).toBeInTheDocument();
});

afterEach(() => {
  localStorage.clear();
});

function renderWithData(data) {
  localStorage.setItem('dvdData', JSON.stringify(data));
  localStorage.setItem('dvdDataTimestamp', Date.now().toString());
  return render(<App />);
}

test('move shows confirmation and moves item on confirm', () => {
  const { container } = renderWithData({ owned: [], wishlist: ['A'] });
  fireEvent.click(screen.getByLabelText('Move'));
  expect(screen.getByText('Move this title to owned?')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Yes'));
  const wishlistItems = container.querySelectorAll('.wishlist-item');
  expect(Array.from(wishlistItems).some((li) => li.textContent.includes('A'))).toBe(false);
  const ownedItems = container.querySelectorAll('.owned-item');
  expect(Array.from(ownedItems).some((li) => li.textContent.includes('A'))).toBe(true);
});

test('delete shows confirmation and removes item on confirm', () => {
  const { container } = renderWithData({ owned: ['B'], wishlist: [] });
  fireEvent.click(screen.getByLabelText('Delete'));
  expect(screen.getByText('Are you sure you want to delete this title?')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Yes'));
  const ownedItems = container.querySelectorAll('.owned-item');
  expect(ownedItems.length).toBe(0);
});
