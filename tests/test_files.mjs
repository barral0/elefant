import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

// Setup mock DOM and globals
const mockElement = {
    addEventListener: () => {},
    appendChild: () => {},
    innerHTML: '',
    value: '',
    style: {},
    focus: () => {},
    select: () => {},
    classList: { add: () => {}, remove: () => {} },
    dataset: {},
    querySelector: () => mockElement,
    querySelectorAll: () => [],
    textContent: ''
};

// Ensure document is available
global.document = {
    getElementById: (id) => mockElement,
    createElement: (tag) => {
        if (tag === 'a') return { ...mockElement, click: () => {} };
        return mockElement;
    },
    body: mockElement,
    createDocumentFragment: () => mockElement,
    activeElement: mockElement,
    querySelectorAll: () => [],
    addEventListener: () => {}
};

// Ensure window is available
global.window = {
    electronAPI: null,
    confirm: () => true,
    addEventListener: () => {}
};

// Ensure localStorage is available
global.localStorage = {
    getItem: () => null,
    setItem: () => {}
};

// Ensure navigator is available
Object.defineProperty(global, 'navigator', {
    value: {
        clipboard: { writeText: () => Promise.resolve() },
        userAgent: 'Node.js'
    },
    writable: true
});

// Import modules AFTER setting up globals
const { moveItem } = await import('../js/files.js');
const { state } = await import('../js/state.js');

describe('moveItem', () => {

    beforeEach(() => {
        // Reset state before each test
        state.items = [];
        state.currentItemId = null;
        global.window.electronAPI = null;
    });

    it('should move a file to a folder', async () => {
        state.items = [
            { id: '1', type: 'file', parentId: null, title: 'file1' },
            { id: '2', type: 'folder', parentId: null, title: 'folder1' }
        ];

        await moveItem('1', '2');

        const movedItem = state.items.find(i => i.id === '1');
        assert.strictEqual(movedItem.parentId, '2');
    });

    it('should move a folder to another folder', async () => {
        state.items = [
            { id: '1', type: 'folder', parentId: null, title: 'folder1' },
            { id: '2', type: 'folder', parentId: null, title: 'folder2' }
        ];

        await moveItem('1', '2');

        const movedItem = state.items.find(i => i.id === '1');
        assert.strictEqual(movedItem.parentId, '2');
    });

    it('should move an item to the root (null parent)', async () => {
        state.items = [
            { id: '1', type: 'file', parentId: '2', title: 'file1' },
            { id: '2', type: 'folder', parentId: null, title: 'folder1' }
        ];

        await moveItem('1', null);

        const movedItem = state.items.find(i => i.id === '1');
        assert.strictEqual(movedItem.parentId, null);
    });

    it('should do nothing if item does not exist', async () => {
        state.items = [
            { id: '2', type: 'folder', parentId: null, title: 'folder1' }
        ];

        await moveItem('999', '2');

        // Verify state is unchanged
        assert.strictEqual(state.items.length, 1);
        assert.strictEqual(state.items[0].id, '2');
    });

    it('should not move a folder into itself', async () => {
        state.items = [
            { id: '1', type: 'folder', parentId: null, title: 'folder1' }
        ];

        await moveItem('1', '1');

        const item = state.items.find(i => i.id === '1');
        assert.strictEqual(item.parentId, null);
    });

    it('should not move a folder into its descendant', async () => {
        state.items = [
             { id: '1', type: 'folder', parentId: null, title: 'folder1' },
             { id: '2', type: 'folder', parentId: '1', title: 'folder2' },
        ];

        await moveItem('1', '2');

        const item = state.items.find(i => i.id === '1');
         assert.strictEqual(item.parentId, null);
    });

     it('should not move a folder into a deep descendant', async () => {
        state.items = [
             { id: '1', type: 'folder', parentId: null, title: 'root' },
             { id: '2', type: 'folder', parentId: '1', title: 'child' },
             { id: '3', type: 'folder', parentId: '2', title: 'grandchild' },
        ];

        await moveItem('1', '3');

        const item = state.items.find(i => i.id === '1');
         assert.strictEqual(item.parentId, null);
    });

    it('should handle Electron rename correctly', async () => {
        // Mock Electron API
        let renameCalled = false;
        let renameOldPath = '';
        let renameNewPath = '';

        global.window.electronAPI = {
             joinPath: async (dir, name) => `${dir}/${name}`,
             renameItem: async (oldPath, newPath) => {
                 renameCalled = true;
                 renameOldPath = oldPath;
                 renameNewPath = newPath;
             }
        };

        state.items = [
            { id: '1', type: 'file', parentId: null, title: 'note.md', fsPath: '/data/note.md' },
            { id: '2', type: 'folder', parentId: null, title: 'docs', fsPath: '/data/docs' }
        ];

        await moveItem('1', '2');

        const movedItem = state.items.find(i => i.id === '1');
        assert.strictEqual(movedItem.parentId, '2');
        assert.strictEqual(movedItem.fsPath, '/data/docs/note.md');
        assert.strictEqual(renameCalled, true);
        assert.strictEqual(renameOldPath, '/data/note.md');
        assert.strictEqual(renameNewPath, '/data/docs/note.md');
    });
});
