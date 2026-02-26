import { test } from 'node:test';
import assert from 'node:assert';
import { sortItems } from '../js/utils.js';

test('sortItems should place folders before files', () => {
    const input = [
        { type: 'file', name: 'file1.md', lastModified: 100 },
        { type: 'folder', name: 'folder1', lastModified: 100 }
    ];
    const sorted = sortItems(input);
    assert.strictEqual(sorted[0].type, 'folder');
    assert.strictEqual(sorted[1].type, 'file');
});

test('sortItems should sort files by lastModified descending', () => {
    const input = [
        { type: 'file', name: 'old.md', lastModified: 100 },
        { type: 'file', name: 'new.md', lastModified: 200 },
        { type: 'file', name: 'mid.md', lastModified: 150 }
    ];
    const sorted = sortItems(input);
    assert.strictEqual(sorted[0].lastModified, 200);
    assert.strictEqual(sorted[1].lastModified, 150);
    assert.strictEqual(sorted[2].lastModified, 100);
});

test('sortItems should sort folders by lastModified descending', () => {
    const input = [
        { type: 'folder', name: 'old_folder', lastModified: 100 },
        { type: 'folder', name: 'new_folder', lastModified: 300 }
    ];
    const sorted = sortItems(input);
    assert.strictEqual(sorted[0].lastModified, 300);
    assert.strictEqual(sorted[1].lastModified, 100);
});

test('sortItems should handle mixed content correctly', () => {
    const input = [
        { type: 'file', name: 'f1.md', lastModified: 500 },
        { type: 'folder', name: 'd1', lastModified: 100 },
        { type: 'folder', name: 'd2', lastModified: 300 },
        { type: 'file', name: 'f2.md', lastModified: 200 }
    ];

    const sorted = sortItems(input);

    // Folders first, sorted by date desc
    assert.strictEqual(sorted[0].type, 'folder');
    assert.strictEqual(sorted[0].lastModified, 300);

    assert.strictEqual(sorted[1].type, 'folder');
    assert.strictEqual(sorted[1].lastModified, 100);

    // Files after, sorted by date desc
    assert.strictEqual(sorted[2].type, 'file');
    assert.strictEqual(sorted[2].lastModified, 500);

    assert.strictEqual(sorted[3].type, 'file');
    assert.strictEqual(sorted[3].lastModified, 200);
});

test('sortItems should not mutate the original array', () => {
    const input = [
        { type: 'file', lastModified: 100 },
        { type: 'folder', lastModified: 200 }
    ];
    const original = [...input];
    sortItems(input);
    assert.deepStrictEqual(input, original);
});
