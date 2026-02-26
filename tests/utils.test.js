import assert from 'node:assert';
import { test, describe } from 'node:test';
import { sortItems } from '../js/utils.js';

describe('sortItems', () => {
    test('should sort folders before files', () => {
        const items = [
            { id: 1, type: 'file', lastModified: 1000 },
            { id: 2, type: 'folder', lastModified: 1000 },
            { id: 3, type: 'file', lastModified: 1000 },
            { id: 4, type: 'folder', lastModified: 1000 },
        ];
        const sorted = sortItems(items);

        assert.strictEqual(sorted[0].type, 'folder');
        assert.strictEqual(sorted[1].type, 'folder');
        assert.strictEqual(sorted[2].type, 'file');
        assert.strictEqual(sorted[3].type, 'file');
    });

    test('should sort items of same type by lastModified descending (newest first)', () => {
        const items = [
            { id: 1, type: 'file', lastModified: 1000 },
            { id: 2, type: 'file', lastModified: 3000 },
            { id: 3, type: 'file', lastModified: 2000 },
            { id: 4, type: 'folder', lastModified: 1000 },
            { id: 5, type: 'folder', lastModified: 3000 },
        ];
        const sorted = sortItems(items);

        // Folders first, sorted by lastModified desc
        assert.strictEqual(sorted[0].id, 5); // folder 3000
        assert.strictEqual(sorted[1].id, 4); // folder 1000

        // Then files, sorted by lastModified desc
        assert.strictEqual(sorted[2].id, 2); // file 3000
        assert.strictEqual(sorted[3].id, 3); // file 2000
        assert.strictEqual(sorted[4].id, 1); // file 1000
    });

    test('should not mutate the original array', () => {
        const items = [
            { type: 'file', lastModified: 1000 },
            { type: 'folder', lastModified: 2000 },
        ];
        const originalCopy = JSON.parse(JSON.stringify(items));

        sortItems(items);

        assert.deepStrictEqual(items, originalCopy);
    });

    test('should handle empty array', () => {
        const items = [];
        const sorted = sortItems(items);
        assert.deepStrictEqual(sorted, []);
    });

    test('should handle array with single item', () => {
        const items = [{ type: 'file', lastModified: 1000 }];
        const sorted = sortItems(items);
        assert.deepStrictEqual(sorted, items);
        assert.notStrictEqual(sorted, items); // Should be a new array
    });

    test('should handle already sorted array', () => {
        const items = [
            { id: 1, type: 'folder', lastModified: 2000 },
            { id: 2, type: 'folder', lastModified: 1000 },
            { id: 3, type: 'file', lastModified: 2000 },
            { id: 4, type: 'file', lastModified: 1000 },
        ];
        const sorted = sortItems(items);
        assert.deepStrictEqual(sorted, items);
    });
});
