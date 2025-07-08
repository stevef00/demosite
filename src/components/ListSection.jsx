import React from 'react';
import { highlightMatch } from '../utils';
import ItemMenu from './ItemMenu';

export default function ListSection({
  title,
  items,
  onMove = () => {},
  onDelete = () => {},
  filter,
  duplicates = new Set(),
}) {

  const normFilter = filter.toLowerCase();
  const matches = items
    .map((t, i) => ({ t, i }))
    .filter((o) => !normFilter || o.t.toLowerCase().includes(normFilter));


  return (
    <div className="list-section">
      <h2>
        {title} <span className="list-count">{items.length}</span>
      </h2>
      <ul>
        {matches.length === 0 && normFilter ? (
          <li className="no-results">No {title.toLowerCase()} items match your search</li>
        ) : (
          matches.map((o) => (
            <li
              key={o.i}
              className={`${title.toLowerCase()}-item${
                duplicates.has(o.t.toLowerCase()) ? ' duplicate-item' : ''
              }`}
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: highlightMatch(o.t, normFilter),
                }}
              />
              <ItemMenu
                onMove={() => onMove(o.i)}
                onDelete={() => onDelete(o.i)}
              />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
