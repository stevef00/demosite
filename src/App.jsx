import React, { useEffect, useRef, useState } from 'react';
import ListSection from './components/ListSection';

export default function App() {
  const [owned, setOwned] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [filter, setFilter] = useState('');
  const [lastModified, setLastModified] = useState('');
  const importRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  function loadFromLocalStorage() {
    const cached = localStorage.getItem('dvdData');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setOwned(parsed.owned || []);
        setWishlist(parsed.wishlist || []);
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
      setOwned(json.owned || []);
      setWishlist(json.wishlist || []);
      saveToLocalStorage(json.owned || [], json.wishlist || []);
    } catch (err) {
      console.error('Could not load dvd_data.json', err);
      setLastModified('Error loading data');
    }
  }

  const moveFromWishlist = (idx) => {
    setWishlist((w) => {
      const newW = [...w];
      const [item] = newW.splice(idx, 1);
      setOwned((o) => {
        const newO = [...o, item];
        saveToLocalStorage(newO, newW);
        return newO;
      });
      return newW;
    });
  };

  const deleteFromWishlist = (idx) => {
    setWishlist((w) => {
      const newW = [...w];
      newW.splice(idx, 1);
      saveToLocalStorage(owned, newW);
      return newW;
    });
  };

  const moveFromOwned = (idx) => {
    setOwned((o) => {
      const newO = [...o];
      const [item] = newO.splice(idx, 1);
      setWishlist((w) => {
        const newW = [...w, item];
        saveToLocalStorage(newO, newW);
        return newW;
      });
      return newO;
    });
  };

  const deleteFromOwned = (idx) => {
    setOwned((o) => {
      const newO = [...o];
      newO.splice(idx, 1);
      saveToLocalStorage(newO, wishlist);
      return newO;
    });
  };

  const addWishlist = (title) => {
    setWishlist((w) => {
      const newW = [...w, title];
      saveToLocalStorage(owned, newW);
      return newW;
    });
  };

  const addOwned = (title) => {
    setOwned((o) => {
      const newO = [...o, title];
      saveToLocalStorage(newO, wishlist);
      return newO;
    });
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
        setOwned(parsed.owned);
        setWishlist(parsed.wishlist);
        setLastModified(new Date().toLocaleString());
        saveToLocalStorage(parsed.owned, parsed.wishlist);
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
      <h1>DVD Collection Tracker</h1>
      <p className="search-info">
        Use the Move button to transfer a title between lists. Use Delete to
        remove it.
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
        onAdd={addWishlist}
        placeholder="Add to wishlist"
        filter={filter}
      />
      <ListSection
        title="Owned"
        items={owned}
        onMove={moveFromOwned}
        onDelete={deleteFromOwned}
        onAdd={addOwned}
        placeholder="Add to owned"
        filter={filter}
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
    </div>
  );
}
