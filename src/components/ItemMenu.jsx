import React, { useEffect, useRef, useState } from 'react';

export default function ItemMenu({ onMove, onDelete }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleClick = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current && buttonRef.current.focus();
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    const firstBtn = menuRef.current.querySelector('button');
    firstBtn && firstBtn.focus();
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const handleKeyNav = (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const buttons = Array.from(menuRef.current.querySelectorAll('button'));
    const idx = buttons.indexOf(document.activeElement);
    const next = e.key === 'ArrowDown' ? idx + 1 : idx - 1;
    const wrap = (n) => (n + buttons.length) % buttons.length;
    buttons[wrap(next)].focus();
  };

  return (
    <div className="item-menu-wrapper">
      <button
        className="item-menu-button"
        aria-label="Actions"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        ref={buttonRef}
      >
        \u22ee
      </button>
      {open && (
        <div className="item-menu" ref={menuRef} onKeyDown={handleKeyNav}>
          <button
            onClick={() => {
              onMove();
              setOpen(false);
            }}
          >
            Move
          </button>
          <button
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
