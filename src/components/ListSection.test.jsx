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
    expect(queryByText('Toy Story')).toBeInTheDocument();
  });
});
