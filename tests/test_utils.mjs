import { generateId } from './utils_temp.mjs';
import assert from 'assert';

console.log('Running tests for generateId...');

// Test 1: Should start with "id-"
const id1 = generateId();
console.log(`Test 1: Check prefix. Generated: ${id1}`);
assert.ok(id1.startsWith('id-'), 'ID should start with "id-"');

// Test 2: Should be a string
console.log('Test 2: Check type');
assert.strictEqual(typeof id1, 'string', 'ID should be a string');

// Test 3: Should have correct length (id- + 9 chars = 12 chars)
// Math.random().toString(36).slice(2, 11) returns up to 9 chars.
// Usually 0.123 -> "0.123".slice(2,11) -> "123".
// However, trailing zeros might make it shorter.
// The implementation is: 'id-' + Math.random().toString(36).slice(2, 11);
// If random number is small, it might be shorter.
// But mostly it should be around 12 chars.
// Let's just check it's reasonable length, >= 3 + 1 = 4 chars.
// Actually, slice(2, 11) extracts characters from index 2 to 11 (9 chars max).
// So max length is 3 + 9 = 12.
console.log(`Test 3: Check length. Length: ${id1.length}`);
assert.ok(id1.length > 3, 'ID should be longer than just "id-"');
assert.ok(id1.length <= 12, 'ID should not exceed expected length');

// Test 4: Uniqueness
const id2 = generateId();
console.log(`Test 4: Check uniqueness. ID1: ${id1}, ID2: ${id2}`);
assert.notStrictEqual(id1, id2, 'Successive IDs should be different');

console.log('All tests passed!');
