// tests/test_files_final.mjs

import { test, describe, before, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';

// 1. Setup global mocks FIRST.

const mockNoteTitleInput = {
    focus: mock.fn(),
    select: mock.fn(),
    value: '',
    addEventListener: mock.fn(),
};

const mockEditor = {
    style: {},
    value: '',
    offsetWidth: 0,
    addEventListener: mock.fn(),
    focus: mock.fn(),
    selectionStart: 0,
    selectionEnd: 0,
    dispatchEvent: mock.fn(),
};

const mockPreview = {
    style: {},
    innerHTML: '',
    offsetWidth: 0,
    addEventListener: mock.fn(),
};

const mockWordCount = {
    textContent: '',
};

const mockFileList = {
    innerHTML: '',
    appendChild: mock.fn(),
    addEventListener: mock.fn(),
};

const mockSaveStatus = {
    className: '',
    textContent: '',
};

// Add elements required by js/images.js
const mockImageModalOverlay = { hidden: true, addEventListener: mock.fn() };
const mockModalImgPreview = { src: '', onload: null };
const mockModalImgAlt = { value: '', focus: mock.fn() };
const mockModalImgWidth = { value: '' };
const mockModalImgQuality = { value: '' };
const mockModalCancelBtn = { addEventListener: mock.fn() };
const mockModalInsertBtn = { addEventListener: mock.fn() };

// Add elements required by js/theme.js
const mockThemeModalOverlay = { hidden: true, addEventListener: mock.fn() };
const mockThemeModalClose = { addEventListener: mock.fn() };
const mockModeToggle = { addEventListener: mock.fn(), querySelectorAll: mock.fn(() => []) };
const mockAccentSwatches = { addEventListener: mock.fn(), querySelectorAll: mock.fn(() => []) };
const mockAccentCustom = { addEventListener: mock.fn() };
const mockEditorFontSelect = { addEventListener: mock.fn(), value: '' };
const mockEditorFontSizeEl = { addEventListener: mock.fn(), value: '15' };
const mockEditorLineHeightEl = { addEventListener: mock.fn(), value: '1.5' };
const mockFontSizeVal = { textContent: '' };
const mockLineHeightVal = { textContent: '' };
const mockThemeResetBtn = { addEventListener: mock.fn() };
const mockLangSelect = { addEventListener: mock.fn(), value: '' };

// Add elements required by js/shortcuts.js
const mockHelpModalOverlay = { hidden: true, addEventListener: mock.fn() };
const mockHelpModalClose = { addEventListener: mock.fn() };

// Add elements required by js/menus.js
const mockContextMenu = { hidden: true, offsetWidth: 0, offsetHeight: 0, style: {}, addEventListener: mock.fn() };
const mockCmRenameBtn = { addEventListener: mock.fn() };
const mockCmDeleteBtn = { addEventListener: mock.fn() };
const mockEditorContextMenu = { hidden: true, offsetWidth: 0, offsetHeight: 0, style: {}, addEventListener: mock.fn() };
const mockAppMenuBtn = { getBoundingClientRect: mock.fn(() => ({ bottom: 0, right: 0 })), setAttribute: mock.fn(), addEventListener: mock.fn() };
const mockAppMenu = { hidden: true, style: {}, addEventListener: mock.fn() };
const mockImageInput = { click: mock.fn(), addEventListener: mock.fn() };
const mockFileInput = { click: mock.fn(), addEventListener: mock.fn() };


const domElements = {
    'note-title': mockNoteTitleInput,
    'editor': mockEditor,
    'preview': mockPreview,
    'word-count': mockWordCount,
    'file-list': mockFileList,
    'save-status': mockSaveStatus,

    // images.js
    'image-modal-overlay': mockImageModalOverlay,
    'modal-img-preview': mockModalImgPreview,
    'modal-img-alt': mockModalImgAlt,
    'modal-img-width': mockModalImgWidth,
    'modal-img-quality': mockModalImgQuality,
    'modal-cancel-btn': mockModalCancelBtn,
    'modal-insert-btn': mockModalInsertBtn,

    // theme.js
    'theme-modal-overlay': mockThemeModalOverlay,
    'theme-modal-close': mockThemeModalClose,
    'mode-toggle': mockModeToggle,
    'accent-swatches': mockAccentSwatches,
    'accent-custom': mockAccentCustom,
    'editor-font-select': mockEditorFontSelect,
    'editor-font-size': mockEditorFontSizeEl,
    'editor-line-height': mockEditorLineHeightEl,
    'font-size-val': mockFontSizeVal,
    'line-height-val': mockLineHeightVal,
    'theme-reset-btn': mockThemeResetBtn,
    'lang-select': mockLangSelect,

    // shortcuts.js
    'help-modal-overlay': mockHelpModalOverlay,
    'help-modal-close': mockHelpModalClose,

    // menus.js
    'context-menu': mockContextMenu,
    'cm-rename': mockCmRenameBtn,
    'cm-delete': mockCmDeleteBtn,
    'editor-context-menu': mockEditorContextMenu,
    'app-menu-btn': mockAppMenuBtn,
    'app-menu': mockAppMenu,
    'image-input': mockImageInput,
    'file-input': mockFileInput,
};

global.document = {
    getElementById: mock.fn((id) => domElements[id] || null),
    createElement: mock.fn((tag) => ({
        tagName: tag.toUpperCase(),
        className: '',
        style: {},
        dataset: {},
        innerHTML: '',
        appendChild: mock.fn(),
        addEventListener: mock.fn(),
        setAttribute: mock.fn(),
        children: [],
        childNodes: [],
        click: mock.fn(),
    })),
    querySelectorAll: mock.fn(() => []),
    body: {
        appendChild: mock.fn(),
        removeChild: mock.fn(),
    },
    documentElement: {
        dataset: {},
        style: {
            setProperty: mock.fn(),
        }
    },
    createDocumentFragment: mock.fn(() => ({
        appendChild: mock.fn(),
    })),
    title: '',
    activeElement: { tagName: 'BODY' },
    addEventListener: mock.fn(),
    execCommand: mock.fn(),
};

global.window = {
    electronAPI: null,
    addEventListener: mock.fn(),
    innerWidth: 1024,
    innerHeight: 768,
};

const storage = new Map();
global.localStorage = {
    getItem: mock.fn((key) => storage.get(key) || null),
    setItem: mock.fn((key, val) => storage.set(key, val)),
    removeItem: mock.fn((key) => storage.delete(key)),
    clear: mock.fn(() => storage.clear()),
};

Object.defineProperty(global, 'navigator', {
    value: {
        clipboard: {
            writeText: mock.fn(),
            readText: mock.fn(),
        }
    },
    writable: true,
    configurable: true,
});

global.marked = { parse: (s) => s };
global.DOMPurify = { sanitize: (s) => s };

let filesModule;
let stateModule;
let renderModule;
let i18nModule;

describe('createNote Integration Test', () => {

    before(async () => {
        // Load modules.
        stateModule = await import('../js/state.js');
        // Ensure indirect dependencies are loaded safely
        await import('../js/images.js');
        await import('../js/theme.js');
        await import('../js/shortcuts.js');
        await import('../js/menus.js');

        // We need i18n to check the expected default title
        i18nModule = await import('../js/i18n.js');

        renderModule = await import('../js/render.js');
        filesModule = await import('../js/files.js');
    });

    beforeEach(() => {
        // Reset State
        stateModule.state.items = [];
        stateModule.state.currentItemId = null;
        global.window.electronAPI = null;
        storage.clear();

        // Reset Mocks
        mockNoteTitleInput.focus.mock.resetCalls();
        mockNoteTitleInput.select.mock.resetCalls();
        mockFileList.appendChild.mock.resetCalls();

        // Reset DOM Element State
        mockFileList.innerHTML = '';
        mockNoteTitleInput.value = '';

        // Ensure language is EN
        i18nModule.setLang('en');
    });

    test('should create a basic note and update UI', async () => {
        await filesModule.createNote();

        // 1. Verify State
        const items = stateModule.state.items;
        assert.equal(items.length, 1, 'Should have 1 item in state');
        const note = items[0];
        assert.match(note.id, /^id-/, 'ID should start with id-');
        assert.equal(note.type, 'file');
        assert.equal(note.parentId, null);
        assert.equal(stateModule.state.currentItemId, note.id);

        // 2. Verify UI Updates (Integration)
        assert.strictEqual(mockFileList.appendChild.mock.callCount() >= 1, true, 'Should append item to file list');

        // 3. Verify Focus
        assert.strictEqual(mockNoteTitleInput.focus.mock.callCount(), 1, 'Should focus title input');
        assert.strictEqual(mockNoteTitleInput.select.mock.callCount(), 1, 'Should select title input');
    });

    test('should create a note with parentId', async () => {
        const parentId = 'parent-folder';
        await filesModule.createNote(parentId);

        const items = stateModule.state.items;
        assert.equal(items.length, 1);
        const note = items[0];
        assert.equal(note.parentId, parentId);
    });

    test('should handle Electron integration for FS sync', async () => {
        const mockJoinPath = mock.fn((dir, file) => `${dir}/${file}`);
        const mockWriteFile = mock.fn(async () => true);

        global.window.electronAPI = {
            joinPath: mockJoinPath,
            writeFile: mockWriteFile,
            readFile: mock.fn(async () => ''),
        };

        // Pre-populate state with root
        stateModule.state.items.push({ id: 'fs-root', type: 'folder', fsPath: '/root' });

        await filesModule.createNote();

        const items = stateModule.state.items;
        assert.equal(items.length, 2); // fs-root + new note
        const note = items.find(i => i.id !== 'fs-root');

        assert.equal(note.parentId, 'fs-root');

        // The default title logic uses i18n. If lang is 'en', 'header.untitled' -> 'Untitled'
        const expectedTitle = i18nModule.t('header.untitled') + '.md';
        assert.equal(note.title, expectedTitle);

        assert.equal(note.fsPath, `/root/${expectedTitle}`);

        assert.strictEqual(mockJoinPath.mock.callCount(), 1);
        assert.strictEqual(mockWriteFile.mock.callCount(), 1);
    });
});
