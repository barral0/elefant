/* =============================================================
   state.js — Shared application state
   ============================================================= */
import { DEFAULT_ITEMS } from './defaults.js';

// ── Items ────────────────────────────────────────────────────
let _items = JSON.parse(localStorage.getItem('app-items')) || DEFAULT_ITEMS;

// Legacy migration — old 'app-notes' key
const _oldNotes = JSON.parse(localStorage.getItem('app-notes'));
if (_oldNotes && !localStorage.getItem('app-items')) {
    _items = _oldNotes.map(n => ({ ...n, type: 'file', parentId: null }));
}

export const state = {
    get items() { return _items; },
    set items(v) { _items = v; },

    currentItemId: localStorage.getItem('app-current-item') || _items.find(i => i.type === 'file')?.id,
    contextTargetId: null,
    imageStore: JSON.parse(localStorage.getItem('app-images')) || {},
};
