
import { test } from 'node:test';
import assert from 'node:assert';

// ── Mock Browser Environment ──────────────────────────────────
global.window = {
    electronAPI: null,
    addEventListener: () => {}
};

global.localStorage = {
    store: {},
    getItem: (key) => global.localStorage.store[key] || null,
    setItem: (key, value) => { global.localStorage.store[key] = value.toString(); },
    removeItem: (key) => { delete global.localStorage.store[key]; }
};

const mockElements = {
    'editor': { value: '', style: {}, offsetWidth: 100, addEventListener: () => {} },
    'preview': { innerHTML: '', style: {}, offsetWidth: 100, addEventListener: () => {} },
    'word-count': { textContent: '' },
    'file-list': { innerHTML: '', appendChild: () => {} },
    'note-title': { value: '', addEventListener: () => {} },
    'help-modal-overlay': { hidden: true, addEventListener: () => {} },
    'help-modal-close': { addEventListener: () => {} },
    // Add missing elements to prevent errors in other modules
    'save-note-btn': { addEventListener: () => {} },
    'new-note-btn': { addEventListener: () => {} },
    'new-folder-btn': { addEventListener: () => {} },
    'open-local-folder-btn': { addEventListener: () => {} },
    'file-input': { addEventListener: () => {} },
    'image-input': { addEventListener: () => {} },
    'app-menu-btn': { addEventListener: () => {} },
    'app-menu-dropdown': { classList: { contains: () => false, remove: () => {} }, contains: () => false },
    'theme-modal-overlay': { addEventListener: () => {} },
    'theme-modal-close': { addEventListener: () => {} },
    'font-select': { addEventListener: () => {}, value: '' },
    'accent-color': { addEventListener: () => {}, value: '' },
    'custom-css': { addEventListener: () => {}, value: '' },
    'theme-btn-light': { addEventListener: () => {} },
    'theme-btn-dark': { addEventListener: () => {} },
    'theme-btn-black': { addEventListener: () => {} },
    'modal-overlay': { addEventListener: () => {}, style: {} },
    'modal-cancel-btn': { addEventListener: () => {} },
    'modal-insert-btn': { addEventListener: () => {} },
    'modal-width': { value: '' },
    'modal-height': { value: '' },
};

global.document = {
    getElementById: (id) => mockElements[id] || {
        style: {},
        addEventListener: () => {},
        hidden: false,
        classList: { add: () => {}, remove: () => {} }
    },
    createElement: (tag) => ({
        style: {},
        classList: { add: () => {}, remove: () => {} },
        appendChild: () => {},
        addEventListener: () => {},
        dataset: {},
        setAttribute: () => {},
        removeAttribute: () => {}
    }),
    createDocumentFragment: () => ({ appendChild: () => {} }),
    createElementNS: () => ({}), // for SVG
    querySelector: () => ({ addEventListener: () => {} }),
    body: { appendChild: () => {}, removeChild: () => {} },
    activeElement: { tagName: 'BODY' },
    addEventListener: () => {}
};

global.marked = {
    parse: (md) => md
};

global.DOMPurify = {
    sanitize: (html) => html
};

global.confirm = () => true;

// ── Import Module Under Test ──────────────────────────────────
const { loadActiveItem } = await import('../js/render.js');
const { state } = await import('../js/state.js');

// ── Tests ─────────────────────────────────────────────────────

test('loadActiveItem loads a file correctly', async () => {
    // Setup state
    state.items = [
        { id: 'note-1', type: 'file', title: 'Test Note', content: '# Hello', parentId: null }
    ];
    state.currentItemId = 'note-1';

    // Reset mocks
    mockElements.editor.value = '';
    mockElements.preview.innerHTML = '';
    mockElements.editor.style.display = '';
    mockElements.preview.style.display = '';
    mockElements['note-title'].value = '';

    // Action
    await loadActiveItem();

    // Assert
    assert.strictEqual(mockElements['note-title'].value, 'Test Note');
    assert.strictEqual(mockElements.editor.value, '# Hello');
    assert.strictEqual(mockElements.editor.style.display, 'block');
    assert.strictEqual(mockElements.preview.style.display, 'block');
});

test('loadActiveItem loads an image correctly', async () => {
    // Setup state
    state.items = [
        { id: 'img-1', type: 'image', title: 'Test Image', fsPath: '/path/to/image.png', parentId: null }
    ];
    state.currentItemId = 'img-1';

    // Reset mocks
    mockElements.editor.value = '';
    mockElements.preview.innerHTML = '';
    mockElements.editor.style.display = '';
    mockElements.preview.style.display = '';
    mockElements['note-title'].value = '';

    // Action
    await loadActiveItem();

    // Assert
    assert.strictEqual(mockElements['note-title'].value, 'Test Image');
    assert.strictEqual(mockElements.editor.style.display, 'none');
    // Check if preview contains the image tag
    assert.ok(mockElements.preview.innerHTML.includes('src="file:///path/to/image.png"'));
});

test('loadActiveItem handles missing item gracefully', async () => {
    state.currentItemId = 'non-existent';

    // Reset mocks
    mockElements['note-title'].value = 'Old Title';

    await loadActiveItem();

    assert.strictEqual(mockElements['note-title'].value, 'Old Title');
});
