const assert = require('assert');
const path = require('path');
const { setAllowedDir, isSafePath } = require('../security.js');

// Mock `process.cwd` for consistent results if needed, but we'll use absolute paths
const TEST_ROOT = path.resolve('/tmp/test-root');

// Set the allowed directory
setAllowedDir(TEST_ROOT);

console.log('Testing security.js...');

// 1. Safe paths
assert.strictEqual(isSafePath(path.join(TEST_ROOT, 'file.txt')), true, 'Inside allowed dir');
assert.strictEqual(isSafePath(path.join(TEST_ROOT, 'subdir', 'file.txt')), true, 'Deep inside allowed dir');
assert.strictEqual(isSafePath(TEST_ROOT), true, 'Root itself is safe');

// 2. Unsafe paths (Path Traversal)
assert.strictEqual(isSafePath(path.join(TEST_ROOT, '..', 'secret.txt')), false, 'Parent directory traversal');
assert.strictEqual(isSafePath(path.join(TEST_ROOT, '../outside')), false, 'Sibling directory traversal');

// 3. Unsafe paths (Absolute paths outside)
assert.strictEqual(isSafePath('/etc/passwd'), false, 'Absolute path outside root');

// 4. Null allowed directory handling
setAllowedDir(null);
assert.strictEqual(isSafePath(TEST_ROOT), false, 'Paths should be unsafe when allowed dir is null');

// 5. Changing allowed directory
setAllowedDir('/var/www');
assert.strictEqual(isSafePath(TEST_ROOT), false, 'Old allowed dir is now unsafe');
assert.strictEqual(isSafePath('/var/www/index.html'), true, 'New allowed dir works');

console.log('All security tests passed!');
