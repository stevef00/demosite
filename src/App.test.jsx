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

test('moving owned item adds it once to wishlist', () => {
  const { container } = renderWithData({ owned: ['C'], wishlist: [] });
  const moveBtn = container.querySelector('.owned-item .move-button');
  fireEvent.click(moveBtn);
  expect(screen.getByText('Move this title back to wishlist?')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Yes'));
  const wishlistItems = container.querySelectorAll('.wishlist-item');
  expect(wishlistItems.length).toBe(1);
  expect(wishlistItems[0].textContent).toContain('C');
});

test('adding to wishlist keeps items sorted', () => {
  const { container } = renderWithData({ owned: [], wishlist: ['B'] });
  fireEvent.click(screen.getByLabelText('Add'));
  fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'A' } });
  fireEvent.click(screen.getByText('Add'));
  const items = Array.from(container.querySelectorAll('.wishlist-item span')).map((el) => el.textContent);
  expect(items).toEqual(['A', 'B']);
});

test('moving from wishlist sorts owned list', () => {
  const { container } = renderWithData({ owned: ['C'], wishlist: ['A'] });
  fireEvent.click(container.querySelector('.wishlist-item .move-button'));
  expect(screen.getByText('Move this title to owned?')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Yes'));
  const ownedTitles = Array.from(container.querySelectorAll('.owned-item span')).map((el) => el.textContent);
  expect(ownedTitles).toEqual(['A', 'C']);
});

test('moving from owned keeps wishlist sorted', () => {
  const { container } = renderWithData({ owned: ['B'], wishlist: ['A'] });
  const moveBtn = container.querySelector('.owned-item .move-button');
  fireEvent.click(moveBtn);
  expect(screen.getByText('Move this title back to wishlist?')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Yes'));
  const wishTitles = Array.from(container.querySelectorAll('.wishlist-item span')).map((el) => el.textContent);
  expect(wishTitles).toEqual(['A', 'B']);
});

test('adding to owned keeps items sorted', () => {
  const { container } = renderWithData({ owned: ['B'], wishlist: [] });
  fireEvent.click(screen.getByLabelText('Add'));
  fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'A' } });
  fireEvent.change(screen.getByLabelText('Target list'), { target: { value: 'owned' } });
  fireEvent.click(screen.getByText('Add'));
  const ownedTitles = Array.from(container.querySelectorAll('.owned-item span')).map((el) => el.textContent);
  expect(ownedTitles).toEqual(['A', 'B']);
});

test('items in both lists get duplicate-item class', () => {
  const { container } = renderWithData({ owned: ['A'], wishlist: ['a'] });
  const wishLi = container.querySelector('.wishlist-item');
  const ownLi = container.querySelector('.owned-item');
  expect(wishLi.classList.contains('duplicate-item')).toBe(true);
  expect(ownLi.classList.contains('duplicate-item')).toBe(true);
});

test('duplicate add shows confirmation and adds on confirm', () => {
  const { container } = renderWithData({ owned: ['A'], wishlist: [] });
  fireEvent.click(screen.getByLabelText('Add'));
  fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'a' } });
  fireEvent.click(screen.getByText('Add'));
  expect(screen.getByText('Title already exists—add anyway?')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Yes'));
  const wishItems = container.querySelectorAll('.wishlist-item span');
  expect(wishItems.length).toBe(1);
  expect(wishItems[0].textContent).toBe('a');
});

test('duplicate add does not add when cancelled', () => {
  const { container } = renderWithData({ owned: ['A'], wishlist: [] });
  fireEvent.click(screen.getByLabelText('Add'));
  fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'a' } });
  fireEvent.click(screen.getByText('Add'));
  expect(screen.getByText('Title already exists—add anyway?')).toBeInTheDocument();
  fireEvent.click(screen.getByText('No'));
  expect(screen.queryByText('Title already exists—add anyway?')).toBeNull();
  const wishItems = container.querySelectorAll('.wishlist-item span');
  expect(wishItems.length).toBe(0);
});

test('duplicate add highlights items on confirm', () => {
  const { container } = renderWithData({ owned: ['A'], wishlist: [] });
  fireEvent.click(screen.getByLabelText('Add'));
  fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'a' } });
  fireEvent.click(screen.getByText('Add'));
  expect(screen.getByText('Title already exists—add anyway?')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Yes'));
  const wishLi = container.querySelector('.wishlist-item');
  const ownLi = container.querySelector('.owned-item');
  expect(wishLi.classList.contains('duplicate-item')).toBe(true);
  expect(ownLi.classList.contains('duplicate-item')).toBe(true);
});

test('moving from wishlist keeps both lists sorted', () => {
  const { container } = renderWithData({ owned: ['A', 'C'], wishlist: ['B', 'D'] });
  fireEvent.click(container.querySelector('.wishlist-item .move-button'));
  expect(screen.getByText('Move this title to owned?')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Yes'));
  const ownedTitles = Array.from(container.querySelectorAll('.owned-item span')).map((el) => el.textContent);
  const wishlistTitles = Array.from(container.querySelectorAll('.wishlist-item span')).map((el) => el.textContent);
  expect(ownedTitles).toEqual(['A', 'B', 'C']);
  expect(wishlistTitles).toEqual(['D']);
});

test('moving from owned keeps both lists sorted', () => {
  const { container } = renderWithData({ owned: ['A', 'C', 'E'], wishlist: ['B', 'D'] });
  const moveBtn = container.querySelectorAll('.owned-item .move-button')[1];
  fireEvent.click(moveBtn);
  expect(screen.getByText('Move this title back to wishlist?')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Yes'));
  const ownedTitles = Array.from(container.querySelectorAll('.owned-item span')).map((el) => el.textContent);
  const wishlistTitles = Array.from(container.querySelectorAll('.wishlist-item span')).map((el) => el.textContent);
  expect(ownedTitles).toEqual(['A', 'E']);
  expect(wishlistTitles).toEqual(['B', 'C', 'D']);
});
