import { generateId } from '../js/utils.js';
import assert from 'assert';

console.log('Testing generateId...');
const id1 = generateId();
const id2 = generateId();

assert.notStrictEqual(id1, id2, 'IDs should be unique');
assert.ok(id1.startsWith('id-'), 'ID should start with id-');
assert.ok(id1.length > 3, 'ID should not be empty');
console.log('generateId tests passed!');
