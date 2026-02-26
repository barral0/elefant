import { test } from 'node:test';
import assert from 'node:assert';
import { escapeHtml } from '../js/utils.js';

test('escapeHtml should return original string when no special characters are present', () => {
    const input = 'Hello World';
    assert.strictEqual(escapeHtml(input), input);
});

test('escapeHtml should escape ampersands', () => {
    assert.strictEqual(escapeHtml('Tom & Jerry'), 'Tom &amp; Jerry');
});

test('escapeHtml should escape less than signs', () => {
    assert.strictEqual(escapeHtml('<script>'), '&lt;script&gt;');
});

test('escapeHtml should escape greater than signs', () => {
    assert.strictEqual(escapeHtml('x > y'), 'x &gt; y');
});

test('escapeHtml should escape double quotes', () => {
    assert.strictEqual(escapeHtml('He said "Hello"'), 'He said &quot;Hello&quot;');
});

test('escapeHtml should escape multiple special characters correctly', () => {
    const input = '<div class="test">Tips & Tricks</div>';
    const expected = '&lt;div class=&quot;test&quot;&gt;Tips &amp; Tricks&lt;/div&gt;';
    assert.strictEqual(escapeHtml(input), expected);
});

test('escapeHtml should return empty string for empty input', () => {
    assert.strictEqual(escapeHtml(''), '');
});

test('escapeHtml should preserve single quotes (current behavior)', () => {
    assert.strictEqual(escapeHtml("It's a test"), "It's a test");
});
