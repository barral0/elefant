/* =============================================================
   state.js — Shared application state
   ============================================================= */

const DEFAULT_CONTENT = `# Welcome to Elefant

A minimalist, distraction-free Markdown editor.

## Features
- **Live Preview** — see formatting as you type
- **Folder Browser** — organise notes into folders
- **Drag & Drop** — move notes between folders
- **Right-click Menu** — rename or delete any item
- **Keyboard Shortcuts** — \`Ctrl+S\` save, \`Ctrl+D\` download
`;

const DEFAULT_ITEMS = [
    { id: 'folder-default', type: 'folder', parentId: null, title: 'Notes', isOpen: true, lastModified: Date.now() },
    { id: 'note-default', type: 'file', parentId: null, title: 'Welcome.md', content: DEFAULT_CONTENT, lastModified: Date.now() },
];

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
