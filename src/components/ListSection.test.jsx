import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ListSection from './ListSection';

describe('ListSection', () => {
  test('calls onAdd when Add button clicked', () => {
    const onAdd = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <ListSection
        title="Wishlist"
        items={[]}
        onMove={() => {}}
        onDelete={() => {}}
        onAdd={onAdd}
        placeholder="Add item"
        filter=""
      />
    );
    fireEvent.change(getByPlaceholderText('Add item'), { target: { value: 'DVD' } });
    fireEvent.click(getByText('Add'));
    expect(onAdd).toHaveBeenCalledWith('DVD');
  });

  test('filters items based on filter prop', () => {
    const { queryByText } = render(
      <ListSection
        title="Wishlist"
        items={['Star Wars', 'Toy Story']}
        onMove={() => {}}
        onDelete={() => {}}
        onAdd={() => {}}
        placeholder="Add item"
        filter="toy"
      />
    );
    expect(queryByText('Star Wars')).toBeNull();
    expect(
      queryByText((content, element) => element.textContent === 'Toy Story')
    ).toBeInTheDocument();
  });

  test('calls onMove when Move button clicked', () => {
    const onMove = jest.fn();
    const { getByLabelText } = render(
      <ListSection
        title="Wishlist"
        items={["A"]}
        onMove={onMove}
        onDelete={() => {}}
        onAdd={() => {}}
        placeholder="Add item"
        filter=""
      />
    );
    fireEvent.click(getByLabelText('Move'));
    expect(onMove).toHaveBeenCalledWith(0);
  });

  test('calls onDelete when Delete button clicked', () => {
    const onDelete = jest.fn();
    const { getByLabelText } = render(
      <ListSection
        title="Wishlist"
        items={["A"]}
        onMove={() => {}}
        onDelete={onDelete}
        onAdd={() => {}}
        placeholder="Add item"
        filter=""
      />
    );
    fireEvent.click(getByLabelText('Delete'));
    expect(onDelete).toHaveBeenCalledWith(0);
  });

  test('adds duplicate-item class when title is duplicate', () => {
    const { getByText } = render(
      <ListSection
        title="Wishlist"
        items={["A", "B"]}
        onMove={() => {}}
        onDelete={() => {}}
        onAdd={() => {}}
        placeholder="Add item"
        filter=""
        duplicates={new Set(["a"])}
      />
    );
    const dupLi = getByText('A').closest('li');
    const otherLi = getByText('B').closest('li');
    expect(dupLi.classList.contains('duplicate-item')).toBe(true);
    expect(otherLi.classList.contains('duplicate-item')).toBe(false);
  });
});
