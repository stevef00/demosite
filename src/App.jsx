import React, { useEffect, useRef, useState, useMemo } from 'react';
import ListSection from './components/ListSection';
import ConfirmDialog from './components/ConfirmDialog';
import AddDialog from './components/AddDialog';
import { getAccessUser } from './utils';
import {
  loadCollection,
  addItem as storageAddItem,
  moveItem as storageMoveItem,
  deleteItem as storageDeleteItem,
  importCollection,
} from './storage';

export default function App() {
  const [owned, setOwned] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [filter, setFilter] = useState('');
  const [user, setUser] = useState(null);
  const importRef = useRef(null);
  const [confirmState, setConfirmState] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const duplicates = useMemo(() => {
    const ownedSet = new Set(owned.map((t) => t.title.toLowerCase()));
    const wishSet = new Set(wishlist.map((t) => t.title.toLowerCase()));
    const dup = new Set();
    ownedSet.forEach((t) => {
      if (wishSet.has(t)) dup.add(t);
    });
    return dup;
  }, [owned, wishlist]);

  useEffect(() => {
    loadData();
    setUser(getAccessUser());
  }, []);


  async function loadData() {
    const { owned: o, wishlist: w } = await loadCollection();
    setOwned(o);
    setWishlist(w);
  }

  const requestConfirm = (message, action) => {
    setConfirmState({
      message,
      onConfirm: async () => {
        await action();
        setConfirmState(null);
      },
    });
  };

  const cancelConfirm = () => setConfirmState(null);

  const moveFromWishlist = (idx) => {
    requestConfirm('Move this title to owned?', async () => {
      const { owned: newO, wishlist: newW } = await storageMoveItem(
        'wishlist',
        idx,
        owned,
        wishlist
      );
      setWishlist(newW);
      setOwned(newO);
    });
  };

  const deleteFromWishlist = (idx) => {
    requestConfirm('Are you sure you want to delete this title?', async () => {
      const { owned: newO, wishlist: newW } = await storageDeleteItem(
        'wishlist',
        idx,
        owned,
        wishlist
      );
      setOwned(newO);
      setWishlist(newW);
    });
  };

  const moveFromOwned = (idx) => {
    requestConfirm('Move this title back to wishlist?', async () => {
      const { owned: newO, wishlist: newW } = await storageMoveItem(
        'owned',
        idx,
        owned,
        wishlist
      );
      setOwned(newO);
      setWishlist(newW);
    });
  };

  const deleteFromOwned = (idx) => {
    requestConfirm('Are you sure you want to delete this title?', async () => {
      const { owned: newO, wishlist: newW } = await storageDeleteItem(
        'owned',
        idx,
        owned,
        wishlist
      );
      setOwned(newO);
      setWishlist(newW);
    });
  };

  const addItem = async (list, title) => {
    const result = await storageAddItem(list, title, owned, wishlist);
    const insert = () => {
      setOwned(result.owned);
      setWishlist(result.wishlist);
    };
    if (result.duplicate) {
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
    reader.onload = async (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed || !Array.isArray(parsed.owned) || !Array.isArray(parsed.wishlist)) {
          throw new Error('Invalid format');
        }
        const extract = (list) => list.map((i) => (typeof i === 'string' ? i : i.title));
        const result = await importCollection(
          extract(parsed.owned),
          extract(parsed.wishlist)
        );
        setOwned(result.owned);
        setWishlist(result.wishlist);
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
      <div className="search-container">
        <input
          id="searchBox"
          type="search"
          placeholder="Search DVDs…"
          aria-label="Search titles"
          autoComplete="off"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <div className="search-info" id="searchInfo">
          {filter
            ? `Found ${
                wishlist.filter((t) =>
                  t.title.toLowerCase().includes(filter.toLowerCase())
                ).length +
                owned.filter((t) =>
                  t.title.toLowerCase().includes(filter.toLowerCase())
                ).length
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
        {user && <p>Logged in as: {user}</p>}
      </footer>
      {addDialogOpen && (
        <AddDialog
          onAdd={async (list, title) => {
            await addItem(list, title);
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
