import React, { useState } from 'react';

export default function AddDialog({ onAdd, onCancel }) {
  const [title, setTitle] = useState('');
  const [list, setList] = useState('wishlist');

  const handleAdd = () => {
    const val = title.trim();
    if (!val) return;
    onAdd(list, val);
  };

  return (
    <div className="modal-overlay">
      <div className="modal add-dialog">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          autoFocus
        />
        <select
          value={list}
          onChange={(e) => setList(e.target.value)}
          aria-label="Target list"
        >
          <option value="wishlist">Wishlist</option>
          <option value="owned">Owned</option>
        </select>
        <div className="modal-buttons">
          <button onClick={handleAdd}>Add</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
