import { test, describe } from 'node:test';
import assert from 'node:assert';
import { generateId, escapeHtml, formatDate, sortItems } from '../js/utils.js';

describe('Utils', () => {

  test('generateId should return a unique string starting with "id-"', () => {
    const id1 = generateId();
    const id2 = generateId();
    assert.match(id1, /^id-/);
    assert.match(id2, /^id-/);
    assert.notEqual(id1, id2);
  });

  test('escapeHtml should escape special characters', () => {
    const input = '<script>alert("XSS")</script> & extra';
    const expected = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt; &amp; extra';
    assert.strictEqual(escapeHtml(input), expected);
  });

  test('formatDate should return a non-empty string', () => {
    const ts = Date.now();
    const formatted = formatDate(ts);
    assert.ok(typeof formatted === 'string');
    assert.ok(formatted.length > 0);
  });

  test('sortItems should sort folders first, then by lastModified descending', () => {
    // Note: The implementation of sortItems uses:
    // if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    // return b.lastModified - a.lastModified;

    // This means folders always come before non-folders.
    // Within the same type, they are sorted by lastModified descending.

    const items = [
      { id: '1', type: 'text', lastModified: 100 },
      { id: '2', type: 'folder', lastModified: 200 },
      { id: '3', type: 'text', lastModified: 300 },
      { id: '4', type: 'folder', lastModified: 50 },
    ];

    // Expected logic:
    // Folders: id 2 (200), id 4 (50). Sorted by time desc => 2, 4.
    // Files: id 3 (300), id 1 (100). Sorted by time desc => 3, 1.
    // Final order: 2, 4, 3, 1.

    const sorted = sortItems(items);

    assert.strictEqual(sorted[0].id, '2', 'First item should be folder (mod 200)');
    assert.strictEqual(sorted[1].id, '4', 'Second item should be folder (mod 50)');
    assert.strictEqual(sorted[2].id, '3', 'Third item should be text (mod 300)');
    assert.strictEqual(sorted[3].id, '1', 'Fourth item should be text (mod 100)');
  });

});
