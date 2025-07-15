import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ owned: [], wishlist: [] })
    })
  );
});

test('renders heading', async () => {
  render(<App />);
  expect(await screen.findByText(/DVD Collection Tracker/i)).toBeInTheDocument();
});

test('search input has aria-label', async () => {
  render(<App />);
  expect(await screen.findByLabelText('Search titles')).toBeInTheDocument();
});

afterEach(() => {
  if (global.fetch) {
    global.fetch.mockReset();
    delete global.fetch;
  }
  document.cookie =
    'CF_Authorization=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
});

async function renderWithData(data) {
  global.fetch = jest.fn((url, options) => {
    if (url === '/api/collection') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
    }
    if (url === '/api/add') {
      const body = JSON.parse(options.body);
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 'new-id', title: body.title }),
      });
    }
    if (url === '/api/move' || url.startsWith('/api/item/')) {
      return Promise.resolve({ ok: true, status: 204, json: () => Promise.resolve({}) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
  const utils = render(<App />);
  await act(async () => {
    await Promise.resolve();
  });
  return utils;
}

test('move shows confirmation and moves item on confirm', async () => {
  const { container } = await renderWithData({ owned: [], wishlist: [{ id: '1', title: 'A' }] });
  fireEvent.click(screen.getByLabelText('Actions'));
  fireEvent.click(screen.getByText('Move'));
  expect(screen.getByText('Move this title to owned?')).toBeInTheDocument();
  await act(async () => {
    fireEvent.click(screen.getByText('Yes'));
  });
  await waitFor(() => {
    const wishlistItems = container.querySelectorAll('.wishlist-item');
    expect(Array.from(wishlistItems).some((li) => li.textContent.includes('A'))).toBe(false);
  });
  const ownedItems = container.querySelectorAll('.owned-item');
  expect(Array.from(ownedItems).some((li) => li.textContent.includes('A'))).toBe(true);
});

test('delete shows confirmation and removes item on confirm', async () => {
  const { container } = await renderWithData({ owned: [{ id: '1', title: 'B' }], wishlist: [] });
  fireEvent.click(screen.getByLabelText('Actions'));
  fireEvent.click(screen.getByText('Delete'));
  expect(screen.getByText('Are you sure you want to delete this title?')).toBeInTheDocument();
  await act(async () => {
    fireEvent.click(screen.getByText('Yes'));
  });
  await waitFor(() => {
    const ownedItems = container.querySelectorAll('.owned-item');
    expect(ownedItems.length).toBe(0);
  });
});

test('moving owned item adds it once to wishlist', async () => {
  const { container } = await renderWithData({ owned: [{ id: '1', title: 'C' }], wishlist: [] });
  const moveBtn = container.querySelector('.owned-item .item-menu-button');
  fireEvent.click(moveBtn);
  fireEvent.click(screen.getByText('Move'));
  expect(screen.getByText('Move this title back to wishlist?')).toBeInTheDocument();
  await act(async () => {
    fireEvent.click(screen.getByText('Yes'));
  });
  await waitFor(() => {
    const wishlistItems = container.querySelectorAll('.wishlist-item');
    expect(wishlistItems.length).toBe(1);
  });
  const wishlistItems = container.querySelectorAll('.wishlist-item');
  expect(wishlistItems[0].textContent).toContain('C');
});

test('adding to wishlist keeps items sorted', async () => {
  const { container } = await renderWithData({ owned: [], wishlist: [{ id: '1', title: 'B' }] });
  fireEvent.click(screen.getByLabelText('Add'));
  fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'A' } });
  await act(async () => { fireEvent.click(screen.getByText('Add')); });
  const items = Array.from(container.querySelectorAll('.wishlist-item span')).map((el) => el.textContent);
  expect(items).toEqual(['A', 'B']);
});

test('moving from wishlist sorts owned list', async () => {
  const { container } = await renderWithData({ owned: [{ id: '2', title: 'C' }], wishlist: [{ id: '1', title: 'A' }] });
  const menuBtn = container.querySelector('.wishlist-item .item-menu-button');
  fireEvent.click(menuBtn);
  fireEvent.click(screen.getByText('Move'));
  expect(screen.getByText('Move this title to owned?')).toBeInTheDocument();
  await act(async () => {
    fireEvent.click(screen.getByText('Yes'));
  });
  await waitFor(() => {
    const ownedTitles = Array.from(container.querySelectorAll('.owned-item span')).map((el) => el.textContent);
    expect(ownedTitles).toEqual(['A', 'C']);
  });
});

test('moving from owned keeps wishlist sorted', async () => {
  const { container } = await renderWithData({ owned: [{ id: '1', title: 'B' }], wishlist: [{ id: '2', title: 'A' }] });
  const moveBtn = container.querySelector('.owned-item .item-menu-button');
  fireEvent.click(moveBtn);
  fireEvent.click(screen.getByText('Move'));
  expect(screen.getByText('Move this title back to wishlist?')).toBeInTheDocument();
  await act(async () => {
    fireEvent.click(screen.getByText('Yes'));
  });
  await waitFor(() => {
    const wishTitles = Array.from(container.querySelectorAll('.wishlist-item span')).map((el) => el.textContent);
    expect(wishTitles).toEqual(['A', 'B']);
  });
});

test('adding to owned keeps items sorted', async () => {
  const { container } = await renderWithData({ owned: [{ id: '1', title: 'B' }], wishlist: [] });
  fireEvent.click(screen.getByLabelText('Add'));
  fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'A' } });
  fireEvent.change(screen.getByLabelText('Target list'), { target: { value: 'owned' } });
  await act(async () => { fireEvent.click(screen.getByText('Add')); });
  const ownedTitles = Array.from(container.querySelectorAll('.owned-item span')).map((el) => el.textContent);
  expect(ownedTitles).toEqual(['A', 'B']);
});

test('items in both lists get duplicate-item class', async () => {
  const { container } = await renderWithData({ owned: [{ id: '1', title: 'A' }], wishlist: [{ id: '2', title: 'a' }] });
  const wishLi = container.querySelector('.wishlist-item');
  const ownLi = container.querySelector('.owned-item');
  expect(wishLi.classList.contains('duplicate-item')).toBe(true);
  expect(ownLi.classList.contains('duplicate-item')).toBe(true);
});

test('duplicate add shows confirmation and adds on confirm', async () => {
  const { container } = await renderWithData({ owned: [{ id: '1', title: 'A' }], wishlist: [] });
  fireEvent.click(screen.getByLabelText('Add'));
  fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'a' } });
  await act(async () => { fireEvent.click(screen.getByText('Add')); });
  expect(screen.getByText('Title already exists—add anyway?')).toBeInTheDocument();
  await act(async () => {
    fireEvent.click(screen.getByText('Yes'));
  });
  await waitFor(() => {
    const wishItems = container.querySelectorAll('.wishlist-item span');
    expect(wishItems.length).toBe(1);
  });
  const wishItems = container.querySelectorAll('.wishlist-item span');
  expect(wishItems[0].textContent).toBe('a');
});

test('duplicate add does not add when cancelled', async () => {
  const { container } = await renderWithData({ owned: [{ id: '1', title: 'A' }], wishlist: [] });
  fireEvent.click(screen.getByLabelText('Add'));
  fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'a' } });
  await act(async () => { fireEvent.click(screen.getByText('Add')); });
  expect(screen.getByText('Title already exists—add anyway?')).toBeInTheDocument();
  await act(async () => {
    fireEvent.click(screen.getByText('No'));
  });
  await waitFor(() => expect(screen.queryByText('Title already exists—add anyway?')).toBeNull());
  const wishItems = container.querySelectorAll('.wishlist-item span');
  expect(wishItems.length).toBe(0);
});

test('duplicate add highlights items on confirm', async () => {
  const { container } = await renderWithData({ owned: [{ id: '1', title: 'A' }], wishlist: [] });
  fireEvent.click(screen.getByLabelText('Add'));
  fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'a' } });
  await act(async () => { fireEvent.click(screen.getByText('Add')); });
  expect(screen.getByText('Title already exists—add anyway?')).toBeInTheDocument();
  await act(async () => {
    fireEvent.click(screen.getByText('Yes'));
  });
  await waitFor(() => {
    const wishLi = container.querySelector('.wishlist-item');
    const ownLi = container.querySelector('.owned-item');
    expect(wishLi.classList.contains('duplicate-item')).toBe(true);
    expect(ownLi.classList.contains('duplicate-item')).toBe(true);
  });
});

test('moving from wishlist keeps both lists sorted', async () => {
  const { container } = await renderWithData({
    owned: [
      { id: '1', title: 'A' },
      { id: '3', title: 'C' }
    ],
    wishlist: [
      { id: '2', title: 'B' },
      { id: '4', title: 'D' }
    ]
  });
  const menuBtn = container.querySelector('.wishlist-item .item-menu-button');
  fireEvent.click(menuBtn);
  fireEvent.click(screen.getByText('Move'));
  expect(screen.getByText('Move this title to owned?')).toBeInTheDocument();
  await act(async () => {
    fireEvent.click(screen.getByText('Yes'));
  });
  await waitFor(() => {
    const ownedTitles = Array.from(container.querySelectorAll('.owned-item span')).map((el) => el.textContent);
    const wishlistTitles = Array.from(container.querySelectorAll('.wishlist-item span')).map((el) => el.textContent);
    expect(ownedTitles).toEqual(['A', 'B', 'C']);
    expect(wishlistTitles).toEqual(['D']);
  });
});

test('moving from owned keeps both lists sorted', async () => {
  const { container } = await renderWithData({
    owned: [
      { id: '1', title: 'A' },
      { id: '3', title: 'C' },
      { id: '5', title: 'E' }
    ],
    wishlist: [
      { id: '2', title: 'B' },
      { id: '4', title: 'D' }
    ]
  });
  const moveBtn = container.querySelectorAll('.owned-item .item-menu-button')[1];
  fireEvent.click(moveBtn);
  fireEvent.click(screen.getByText('Move'));
  expect(screen.getByText('Move this title back to wishlist?')).toBeInTheDocument();
  await act(async () => {
    fireEvent.click(screen.getByText('Yes'));
  });
  await waitFor(() => {
    const ownedTitles = Array.from(container.querySelectorAll('.owned-item span')).map((el) => el.textContent);
    const wishlistTitles = Array.from(container.querySelectorAll('.wishlist-item span')).map((el) => el.textContent);
    expect(ownedTitles).toEqual(['A', 'E']);
    expect(wishlistTitles).toEqual(['B', 'C', 'D']);
  });
});

test('shows user from Access cookie', () => {
  const payload = btoa(JSON.stringify({ email: 'test@example.com' }));
  document.cookie = `CF_Authorization=header.${payload}.sig`;
  render(<App />);
  expect(screen.getByText(/Logged in as:/)).toHaveTextContent('test@example.com');
});
