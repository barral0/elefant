// Setup browser mocks BEFORE importing modules
// We need to define globals before any import that might use them.
// Since imports are hoisted, we need to do this carefully or use a separate setup file that runs before.
// However, `node --test` runs files directly.
// A common workaround is to assign globals in a separate file imported first, OR rely on the fact that `import` statements are hoisted but side-effects are executed in order.
// BUT, static imports are evaluated before the module body starts executing.
// So we cannot set globals in this file before `import { state } ...`.
//
// We will use dynamic imports to ensure globals are set before the modules are loaded.

import { test, describe, before, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { createMockBrowser } from './setup.mjs';

// Setup browser mocks
createMockBrowser();

// Mock localStorage to hold state
let mockStorage = {};
global.localStorage = {
    getItem: (key) => mockStorage[key] || null,
    setItem: (key, value) => { mockStorage[key] = value; },
    removeItem: (key) => { delete mockStorage[key]; },
    clear: () => { mockStorage = {}; }
};

describe('deleteCurrentItem', () => {
    let deleteCurrentItem;
    let state;
    let originalConfirm;
    let originalAlert;
    let confirmResult = true;
    let alertCalled = false;
    let electronDeleteCalled = false;

    // Load modules dynamically in before() to ensure globals are set first
    // Note: because `state.js` executes top-level code that reads localStorage, we MUST have localStorage ready.
    // We already set it above.

    before(async () => {
        const filesModule = await import('../js/files.js');
        const stateModule = await import('../js/state.js');
        deleteCurrentItem = filesModule.deleteCurrentItem;
        state = stateModule.state;
    });

    beforeEach(() => {
        // Reset state
        mockStorage = {};

        // Reset state items
        state.items = [];
        state.currentItemId = null;
        state.imageStore = {};

        // Mock window functions
        originalConfirm = global.confirm;
        originalAlert = global.alert;

        global.confirm = () => confirmResult;
        global.alert = () => { alertCalled = true; };

        confirmResult = true;
        alertCalled = false;
        electronDeleteCalled = false;

        // Reset Electron API
        global.window.electronAPI = null;
    });

    afterEach(() => {
        global.confirm = originalConfirm;
        global.alert = originalAlert;
    });

    test('should delete a file successfully', async () => {
        state.items = [
            { id: 'file1', type: 'file', parentId: null, title: 'Note 1' },
            { id: 'file2', type: 'file', parentId: null, title: 'Note 2' }
        ];
        state.currentItemId = 'file1';

        await deleteCurrentItem();

        assert.strictEqual(state.items.length, 1);
        assert.strictEqual(state.items[0].id, 'file2');
        assert.strictEqual(state.currentItemId, 'file2');
    });

    test('should not delete if user cancels', async () => {
        state.items = [
            { id: 'file1', type: 'file', parentId: null, title: 'Note 1' },
            { id: 'file2', type: 'file', parentId: null, title: 'Note 2' }
        ];
        state.currentItemId = 'file1';
        confirmResult = false;

        await deleteCurrentItem();

        assert.strictEqual(state.items.length, 2);
        assert.strictEqual(state.items[0].id, 'file1');
    });

    test('should prevent deleting the last file', async () => {
        state.items = [
            { id: 'file1', type: 'file', parentId: null, title: 'Last Note' }
        ];
        state.currentItemId = 'file1';

        await deleteCurrentItem();

        assert.strictEqual(state.items.length, 1);
        assert.strictEqual(alertCalled, true);
    });

    test('should delete folder and its descendants', async () => {
        state.items = [
            { id: 'folder1', type: 'folder', parentId: null, title: 'Folder' }, // Added title
            { id: 'file1', type: 'file', parentId: 'folder1', title: 'File 1' }, // Added title
            { id: 'subfolder', type: 'folder', parentId: 'folder1', title: 'Subfolder' }, // Added title
            { id: 'file2', type: 'file', parentId: 'subfolder', title: 'File 2' }, // Added title
            { id: 'file3', type: 'file', parentId: null, title: 'File 3' } // Outside folder
        ];
        state.currentItemId = 'folder1';

        await deleteCurrentItem();

        assert.strictEqual(state.items.length, 1);
        assert.strictEqual(state.items[0].id, 'file3');
    });

    test('should call electronAPI.deleteItem if available', async () => {
        state.items = [
            { id: 'file1', type: 'file', parentId: null, fsPath: '/path/to/file1', title: 'File 1' }, // Added title
            { id: 'file2', type: 'file', parentId: null, title: 'File 2' }
        ];
        state.currentItemId = 'file1';

        global.window.electronAPI = {
            deleteItem: async (path) => {
                electronDeleteCalled = true;
                assert.strictEqual(path, '/path/to/file1');
            },
            joinPath: async () => {},
            writeFile: async () => {},
            mkdir: async () => {},
            readFile: async () => {}
        };

        await deleteCurrentItem();

        assert.strictEqual(electronDeleteCalled, true);
        assert.strictEqual(state.items.length, 1);
    });

    test('should not delete root folder in electron mode', async () => {
        state.items = [
            { id: 'fs-root', type: 'folder', parentId: null, fsPath: '/root', title: 'Root' },
             { id: 'file1', type: 'file', parentId: 'fs-root', title: 'File 1' }
        ];
        state.currentItemId = 'fs-root';
         global.window.electronAPI = {
            deleteItem: async () => {
                electronDeleteCalled = true;
            }
        };

        await deleteCurrentItem();

        // Should return early and not delete anything
        assert.strictEqual(electronDeleteCalled, false);
        assert.strictEqual(state.items.length, 2);
    });
});
