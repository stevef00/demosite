import React, { useState } from 'react';

export default function ListSection({
  title,
  items,
  onItemClick,
  onAdd,
  placeholder,
  filter,
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

  const highlightMatch = (text) => {
    if (!normFilter) return text;
    const regex = new RegExp(`(${normFilter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="match-highlight">$1</span>');
  };

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
              className={`${title.toLowerCase()}-item`}
              onClick={(e) => onItemClick(o.i, e.altKey)}
              dangerouslySetInnerHTML={{ __html: highlightMatch(o.t) }}
            />
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
