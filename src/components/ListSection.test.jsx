import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ListSection from './ListSection';

describe('ListSection', () => {

  test('filters items based on filter prop', () => {
    const { queryByText } = render(
      <ListSection
        title="Wishlist"
        items={[
          { id: '1', title: 'Star Wars' },
          { id: '2', title: 'Toy Story' },
        ]}
        onMove={() => {}}
        onDelete={() => {}}
        filter="toy"
      />
    );
    expect(queryByText('Star Wars')).toBeNull();
    expect(
      queryByText((content, element) => element.textContent === 'Toy Story')
    ).toBeInTheDocument();
  });

  test('calls onMove when Move option clicked', () => {
    const onMove = jest.fn();
    const { getByLabelText, getByText } = render(
      <ListSection
        title="Wishlist"
        items={[{ id: '1', title: 'A' }]}
        onMove={onMove}
        onDelete={() => {}}
        filter=""
      />
    );
    fireEvent.click(getByLabelText('Actions'));
    fireEvent.click(getByText('Move'));
    expect(onMove).toHaveBeenCalledWith(0);
  });

  test('calls onDelete when Delete option clicked', () => {
    const onDelete = jest.fn();
    const { getByLabelText, getByText } = render(
      <ListSection
        title="Wishlist"
        items={[{ id: '1', title: 'A' }]}
        onMove={() => {}}
        onDelete={onDelete}
        filter=""
      />
    );
    fireEvent.click(getByLabelText('Actions'));
    fireEvent.click(getByText('Delete'));
    expect(onDelete).toHaveBeenCalledWith(0);
  });

  test('adds duplicate-item class when title is duplicate', () => {
    const { getByText } = render(
      <ListSection
        title="Wishlist"
        items={[
          { id: '1', title: 'A' },
          { id: '2', title: 'B' },
        ]}
        onMove={() => {}}
        onDelete={() => {}}
        filter=""
        duplicates={new Set(["a"])}
      />
    );
    const dupLi = getByText('A').closest('li');
    const otherLi = getByText('B').closest('li');
    expect(dupLi.classList.contains('duplicate-item')).toBe(true);
    expect(otherLi.classList.contains('duplicate-item')).toBe(false);
  });

  test('multiple duplicates all receive duplicate-item class', () => {
    const { getByText } = render(
      <ListSection
        title="Wishlist"
        items={[
          { id: '1', title: 'A' },
          { id: '2', title: 'B' },
          { id: '3', title: 'C' },
        ]}
        onMove={() => {}}
        onDelete={() => {}}
        filter=""
        duplicates={new Set(["a", "c"])}
      />
    );
    const aLi = getByText('A').closest('li');
    const bLi = getByText('B').closest('li');
    const cLi = getByText('C').closest('li');
    expect(aLi.classList.contains('duplicate-item')).toBe(true);
    expect(cLi.classList.contains('duplicate-item')).toBe(true);
    expect(bLi.classList.contains('duplicate-item')).toBe(false);
  });
});
