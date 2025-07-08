import React, { useState } from 'react';
import { highlightMatch } from '../utils';

export default function ListSection({
  title,
  items,
  onMove = () => {},
  onAdd,
  onDelete = () => {},
  placeholder,
  filter,
  duplicates = new Set(),
}) {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    const val = input.trim();
    if (!val) return;
    onAdd(val);
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

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
              <button
                className="move-button"
                aria-label="Move"
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(o.i);
                }}
              >
                ➡️
              </button>
              <button
                className="delete-button"
                aria-label="Delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(o.i);
                }}
              >
                🗑️
              </button>
            </li>
          ))
        )}
      </ul>
      <div className="add-form">
        <input
          type="text"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleAdd}>Add</button>
      </div>
    </div>
  );
}
