import { test, describe, it, mock, afterEach } from 'node:test';
import assert from 'node:assert';
import { generateId } from '../js/utils.js';

describe('generateId', () => {
  // Ensure mocks are cleaned up after each test to prevent side effects
  afterEach(() => {
    mock.restoreAll();
  });

  it('should return a string', () => {
    const id = generateId();
    assert.strictEqual(typeof id, 'string');
  });

  it('should start with "id-"', () => {
    const id = generateId();
    assert.ok(id.startsWith('id-'));
  });

  it('should generate unique ids (probabilistic)', () => {
    const id1 = generateId();
    const id2 = generateId();
    assert.notStrictEqual(id1, id2);
  });

  it('should handle Math.random() = 0 edge case', () => {
    mock.method(Math, 'random', () => 0);
    const id = generateId();
    // (0).toString(36) is "0". slice(2, 11) is "".
    assert.strictEqual(id, 'id-');
  });

  it('should handle Math.random() returning short string', () => {
    // 0.5.toString(36) is "0.i"
    mock.method(Math, 'random', () => 0.5);
    const id = generateId();
    // "0.i".slice(2, 11) is "i"
    assert.strictEqual(id, 'id-i');
  });

  it('should handle Math.random() returning long string', () => {
    // Mocking to verify slicing.
    // e.g. 0.123456789 -> 0.4f4y5e...
    mock.method(Math, 'random', () => 0.123456789);
    const id = generateId();

    // Verify expected output for this fixed input
    // The id should have 'id-' + 9 chars if the string is long enough.
    const part = id.substring(3);
    assert.ok(part.length <= 9);
  });
});
