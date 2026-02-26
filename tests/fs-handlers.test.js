const { test, describe, beforeEach, mock } = require('node:test');
const assert = require('node:assert');
const { createFsHandlers } = require('../fs-handlers');

// Mock path module
const mockPath = {
    join: (...parts) => parts.join('/'),
};

describe('fs-handlers', () => {
    let handlers;
    let mockFsPromises;

    beforeEach(() => {
        // Reset mocks before each test
        mockFsPromises = {
            readdir: mock.fn(),
            readFile: mock.fn(),
            writeFile: mock.fn(),
            mkdir: mock.fn(),
            stat: mock.fn(),
            rm: mock.fn(),
            unlink: mock.fn(),
            rename: mock.fn(),
        };

        handlers = createFsHandlers(mockFsPromises, mockPath);
    });

    describe('joinPath', () => {
        test('should join path parts', () => {
            const result = handlers.joinPath('a', 'b', 'c');
            assert.strictEqual(result, 'a/b/c');
        });
    });

    describe('readDirectory', () => {
        test('should scan directory recursively and return items', async () => {
            // Setup directory structure
            // /root
            //   - folder1 (dir)
            //     - file1.md
            //   - image.png
            //   - other.txt (should be ignored)
            //   - .hidden (should be ignored)

            mockFsPromises.readdir.mock.mockImplementation(async (path, options) => {
                if (path === '/root') {
                    return [
                        { name: 'folder1', isDirectory: () => true, isFile: () => false },
                        { name: 'image.png', isDirectory: () => false, isFile: () => true },
                        { name: 'other.txt', isDirectory: () => false, isFile: () => true },
                        { name: '.hidden', isDirectory: () => false, isFile: () => true },
                    ];
                }
                if (path === '/root/folder1') {
                    return [
                        { name: 'file1.md', isDirectory: () => false, isFile: () => true },
                    ];
                }
                return [];
            });

            mockFsPromises.stat.mock.mockImplementation(async () => {
                return { mtimeMs: 1234567890 };
            });

            const items = await handlers.readDirectory('/root');

            assert.ok(items.length > 0);

            // Check for folder
            const folder = items.find(i => i.title === 'folder1');
            assert.ok(folder);
            assert.strictEqual(folder.type, 'folder');
            assert.strictEqual(folder.fsPath, '/root/folder1');

            // Check for image
            const image = items.find(i => i.title === 'image.png');
            assert.ok(image);
            assert.strictEqual(image.type, 'image');

            // Check for markdown file inside folder
            const file = items.find(i => i.title === 'file1.md');
            assert.ok(file);
            assert.strictEqual(file.type, 'file');
            assert.strictEqual(file.parentId, folder.id);

            // Check ignored files
            const txt = items.find(i => i.title === 'other.txt');
            assert.strictEqual(txt, undefined);

            const hidden = items.find(i => i.title === '.hidden');
            assert.strictEqual(hidden, undefined);
        });

        test('should handle errors gracefully', async () => {
            mockFsPromises.readdir.mock.mockImplementation(async () => {
                throw new Error('Access denied');
            });

            // Suppress console.error for this test
            const originalConsoleError = console.error;
            console.error = () => {};

            const result = await handlers.readDirectory('/invalid');

            console.error = originalConsoleError;

            assert.strictEqual(result, null);
        });
    });

    describe('readFile', () => {
        test('should read file content', async () => {
            mockFsPromises.readFile.mock.mockImplementation(async () => 'content');
            const result = await handlers.readFile('/path/to/file');
            assert.strictEqual(result, 'content');
            assert.strictEqual(mockFsPromises.readFile.mock.calls.length, 1);
        });

        test('should handle read errors', async () => {
            mockFsPromises.readFile.mock.mockImplementation(async () => {
                throw new Error('Read error');
            });
            const originalConsoleError = console.error;
            console.error = () => {};

            const result = await handlers.readFile('/path/to/file');

            console.error = originalConsoleError;
            assert.strictEqual(result, null);
        });
    });

    describe('writeFile', () => {
        test('should write file content', async () => {
            mockFsPromises.writeFile.mock.mockImplementation(async () => undefined);
            const result = await handlers.writeFile('/path/to/file', 'content');
            assert.strictEqual(result, true);
            assert.strictEqual(mockFsPromises.writeFile.mock.calls.length, 1);
        });

        test('should handle write errors', async () => {
            mockFsPromises.writeFile.mock.mockImplementation(async () => {
                throw new Error('Write error');
            });
            const originalConsoleError = console.error;
            console.error = () => {};

            const result = await handlers.writeFile('/path/to/file', 'content');

            console.error = originalConsoleError;
            assert.strictEqual(result, false);
        });
    });

    describe('mkdir', () => {
        test('should create directory', async () => {
            mockFsPromises.mkdir.mock.mockImplementation(async () => undefined);
            const result = await handlers.mkdir('/path/to/dir');
            assert.strictEqual(result, true);
            assert.strictEqual(mockFsPromises.mkdir.mock.calls.length, 1);
            assert.deepStrictEqual(mockFsPromises.mkdir.mock.calls[0].arguments, ['/path/to/dir', { recursive: true }]);
        });

         test('should handle mkdir errors', async () => {
            mockFsPromises.mkdir.mock.mockImplementation(async () => {
                throw new Error('Mkdir error');
            });
            const originalConsoleError = console.error;
            console.error = () => {};

            const result = await handlers.mkdir('/path/to/dir');

            console.error = originalConsoleError;
            assert.strictEqual(result, false);
        });
    });

    describe('deleteItem', () => {
        test('should delete file', async () => {
            mockFsPromises.stat.mock.mockImplementation(async () => ({ isDirectory: () => false }));
            mockFsPromises.unlink.mock.mockImplementation(async () => undefined);

            const result = await handlers.deleteItem('/path/to/file');

            assert.strictEqual(result, true);
            assert.strictEqual(mockFsPromises.unlink.mock.calls.length, 1);
        });

        test('should delete directory recursively', async () => {
            mockFsPromises.stat.mock.mockImplementation(async () => ({ isDirectory: () => true }));
            mockFsPromises.rm.mock.mockImplementation(async () => undefined);

            const result = await handlers.deleteItem('/path/to/dir');

            assert.strictEqual(result, true);
            assert.strictEqual(mockFsPromises.rm.mock.calls.length, 1);
            assert.deepStrictEqual(mockFsPromises.rm.mock.calls[0].arguments, ['/path/to/dir', { recursive: true, force: true }]);
        });

        test('should handle delete errors', async () => {
             mockFsPromises.stat.mock.mockImplementation(async () => {
                throw new Error('Stat error');
            });
            const originalConsoleError = console.error;
            console.error = () => {};

            const result = await handlers.deleteItem('/path/to/item');

            console.error = originalConsoleError;
            assert.strictEqual(result, false);
        });
    });

    describe('renameItem', () => {
        test('should rename item', async () => {
            mockFsPromises.rename.mock.mockImplementation(async () => undefined);
            const result = await handlers.renameItem('/old', '/new');
            assert.strictEqual(result, true);
            assert.strictEqual(mockFsPromises.rename.mock.calls.length, 1);
        });

        test('should handle rename errors', async () => {
            mockFsPromises.rename.mock.mockImplementation(async () => {
                throw new Error('Rename error');
            });
            const originalConsoleError = console.error;
            console.error = () => {};

            const result = await handlers.renameItem('/old', '/new');

            console.error = originalConsoleError;
            assert.strictEqual(result, false);
        });
    });
});
