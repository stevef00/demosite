import React, { useEffect, useRef, useState, useMemo } from 'react';
import ListSection from './components/ListSection';
import ConfirmDialog from './components/ConfirmDialog';
import AddDialog from './components/AddDialog';
import { sortTitles } from './utils';

export default function App() {
  const [owned, setOwned] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [filter, setFilter] = useState('');
  const [lastModified, setLastModified] = useState('');
  const importRef = useRef(null);
  const [confirmState, setConfirmState] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const duplicates = useMemo(() => {
    const ownedSet = new Set(owned.map((t) => t.toLowerCase()));
    const wishSet = new Set(wishlist.map((t) => t.toLowerCase()));
    const dup = new Set();
    ownedSet.forEach((t) => {
      if (wishSet.has(t)) dup.add(t);
    });
    return dup;
  }, [owned, wishlist]);

  useEffect(() => {
    loadData();
  }, []);

  function loadFromLocalStorage() {
    const cached = localStorage.getItem('dvdData');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const sortedO = sortTitles(parsed.owned || []);
        const sortedW = sortTitles(parsed.wishlist || []);
        setOwned(sortedO);
        setWishlist(sortedW);
        saveToLocalStorage(sortedO, sortedW);
        const ts = localStorage.getItem('dvdDataTimestamp');
        if (ts) {
          const date = new Date(parseInt(ts, 10));
          setLastModified(date.toLocaleString());
        } else {
          setLastModified('Local data');
        }
        return true;
      } catch (err) {
        console.error('Failed to parse cached data', err);
        localStorage.removeItem('dvdData');
        localStorage.removeItem('dvdDataTimestamp');
      }
    }
    return false;
  }

  function saveToLocalStorage(o = owned, w = wishlist) {
    localStorage.setItem('dvdData', JSON.stringify({ owned: o, wishlist: w }));
    localStorage.setItem('dvdDataTimestamp', Date.now().toString());
  }

  async function loadData() {
    if (loadFromLocalStorage()) return;

    try {
      const res = await fetch('dvd_data.json');
      if (!res.ok) throw new Error(res.status);
      const lm = res.headers.get('last-modified');
      if (lm) setLastModified(new Date(lm).toLocaleString());
      const json = await res.json();
      const sortedO = sortTitles(json.owned || []);
      const sortedW = sortTitles(json.wishlist || []);
      setOwned(sortedO);
      setWishlist(sortedW);
      saveToLocalStorage(sortedO, sortedW);
    } catch (err) {
      console.error('Could not load dvd_data.json', err);
      setLastModified('Error loading data');
    }
  }

  const requestConfirm = (message, action) => {
    setConfirmState({
      message,
      onConfirm: () => {
        action();
        setConfirmState(null);
      },
    });
  };

  const cancelConfirm = () => setConfirmState(null);

  const moveFromWishlist = (idx) => {
    requestConfirm('Move this title to owned?', () => {
      const item = wishlist[idx];
      const newW = sortTitles(wishlist.filter((_, i) => i !== idx));
      const newO = sortTitles([...owned, item]);
      setWishlist(newW);
      setOwned(newO);
      saveToLocalStorage(newO, newW);
    });
  };

  const deleteFromWishlist = (idx) => {
    requestConfirm('Are you sure you want to delete this title?', () => {
      setWishlist((w) => {
        const newW = [...w];
        newW.splice(idx, 1);
        saveToLocalStorage(owned, newW);
        return newW;
      });
    });
  };

  const moveFromOwned = (idx) => {
    requestConfirm('Move this title back to wishlist?', () => {
      const item = owned[idx];
      const newO = sortTitles(owned.filter((_, i) => i !== idx));
      const newW = sortTitles([...wishlist, item]);
      setOwned(newO);
      setWishlist(newW);
      saveToLocalStorage(newO, newW);
    });
  };

  const deleteFromOwned = (idx) => {
    requestConfirm('Are you sure you want to delete this title?', () => {
      setOwned((o) => {
        const newO = [...o];
        newO.splice(idx, 1);
        saveToLocalStorage(newO, wishlist);
        return newO;
      });
    });
  };

  const addItem = (list, title) => {
    const normalized = title.toLowerCase();
    const exists =
      owned.some((t) => t.toLowerCase() === normalized) ||
      wishlist.some((t) => t.toLowerCase() === normalized);

    const insert = () => {
      if (list === 'wishlist') {
        setWishlist((w) => {
          const newW = sortTitles([...w, title]);
          saveToLocalStorage(owned, newW);
          return newW;
        });
      } else {
        setOwned((o) => {
          const newO = sortTitles([...o, title]);
          saveToLocalStorage(newO, wishlist);
          return newO;
        });
      }
    };

    if (exists) {
      requestConfirm('Title already exists—add anyway?', insert);
    } else {
      insert();
    }
  };

  const clearSearch = () => setFilter('');

  const exportData = () => {
    const blob = new Blob([
      JSON.stringify({ owned, wishlist }, null, 2)
    ], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dvd_data.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed || !Array.isArray(parsed.owned) || !Array.isArray(parsed.wishlist)) {
          throw new Error('Invalid format');
        }
        const sortedO = sortTitles(parsed.owned);
        const sortedW = sortTitles(parsed.wishlist);
        setOwned(sortedO);
        setWishlist(sortedW);
        setLastModified(new Date().toLocaleString());
        saveToLocalStorage(sortedO, sortedW);
      } catch (err) {
        alert('Invalid JSON file');
        console.error('Import failed', err);
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <header>
        <h1>DVD Collection Tracker</h1>
        <button
          className="add-button"
          aria-label="Add"
          onClick={() => setAddDialogOpen(true)}
        >
          +
        </button>
      </header>
      <p className="search-info">
        Use the Move button to send a title to the other list or Delete to
        remove it. A confirmation dialog will appear before either action is
        applied.
      </p>
      <div className="search-container">
        <input
          id="searchBox"
          type="search"
          placeholder="Search DVDs…"
          autoComplete="off"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <div className="search-info" id="searchInfo">
          {filter
            ? `Found ${
                wishlist.filter((t) => t.toLowerCase().includes(filter.toLowerCase())).length +
                owned.filter((t) => t.toLowerCase().includes(filter.toLowerCase())).length
              } matches`
            : 'Type to search both lists'}
        </div>
        <button className="clear-search-button" onClick={clearSearch} style={{ display: filter ? 'inline-block' : 'none' }}>
          Clear Search
        </button>
      </div>
      <ListSection
        title="Wishlist"
        items={wishlist}
        onMove={moveFromWishlist}
        onDelete={deleteFromWishlist}
        filter={filter}
        duplicates={duplicates}
      />
      <ListSection
        title="Owned"
        items={owned}
        onMove={moveFromOwned}
        onDelete={deleteFromOwned}
        filter={filter}
        duplicates={duplicates}
      />
      <div className="storage-buttons">
        <button onClick={exportData}>Export</button>
        <input
          ref={importRef}
          type="file"
          accept="application/json"
          hidden
          onChange={handleImport}
        />
        <button onClick={() => importRef.current && importRef.current.click()}>Import</button>
      </div>
      <footer>
        <p>Last modified: {lastModified || 'Loading...'}</p>
      </footer>
      {addDialogOpen && (
        <AddDialog
          onAdd={(list, title) => {
            addItem(list, title);
            setAddDialogOpen(false);
          }}
          onCancel={() => setAddDialogOpen(false)}
        />
      )}
      {confirmState && (
        <ConfirmDialog
          message={confirmState.message}
          onConfirm={confirmState.onConfirm}
          onCancel={cancelConfirm}
        />
      )}
    </div>
  );
}
