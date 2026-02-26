const { test, mock } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');

// The module under test
const { handleWriteFile } = require('../fs-handlers');

test('fs:writeFile handler', async (t) => {

    await t.test('returns true on successful write', async () => {
        // Mock fs.promises.writeFile to succeed
        const writeFileMock = mock.method(fs.promises, 'writeFile', async () => {
            return undefined;
        });

        const result = await handleWriteFile({}, '/path/to/file.txt', 'content');

        assert.strictEqual(result, true);
        assert.strictEqual(writeFileMock.mock.calls.length, 1);
        const args = writeFileMock.mock.calls[0].arguments;
        assert.strictEqual(args[0], '/path/to/file.txt');
        assert.strictEqual(args[1], 'content');
        assert.strictEqual(args[2], 'utf8');

        writeFileMock.mock.restore();
    });

    await t.test('returns false and logs error on failure', async () => {
        // Mock fs.promises.writeFile to throw
        const writeFileMock = mock.method(fs.promises, 'writeFile', async () => {
            throw new Error('Disk full');
        });

        // Mock console.error to avoid polluting output
        const consoleErrorMock = mock.method(console, 'error', () => {});

        const result = await handleWriteFile({}, '/path/to/file.txt', 'content');

        assert.strictEqual(result, false);
        assert.strictEqual(consoleErrorMock.mock.calls.length, 1);
        const errorArgs = consoleErrorMock.mock.calls[0].arguments;
        assert.strictEqual(errorArgs[0], 'Failed to write file:');
        assert.ok(errorArgs[1] instanceof Error);
        assert.strictEqual(errorArgs[1].message, 'Disk full');

        writeFileMock.mock.restore();
        consoleErrorMock.mock.restore();
    });
});
