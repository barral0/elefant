function createFsHandlers(fsPromises, path) {
    return {
        joinPath: (...parts) => path.join(...parts),

        readDirectory: async (dirPath) => {
            const items = [];

            async function scan(currentPath, parentId = null) {
                const entries = await fsPromises.readdir(currentPath, { withFileTypes: true });
                for (const entry of entries) {
                    // Ignore hidden files / node_modules
                    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

                    const fullPath = path.join(currentPath, entry.name);
                    const id = Buffer.from(fullPath).toString('base64'); // use path as stable ID

                    if (entry.isDirectory()) {
                        items.push({
                            id,
                            type: 'folder',
                            parentId,
                            title: entry.name,
                            isOpen: false,
                            fsPath: fullPath,
                        });
                        await scan(fullPath, id);
                    } else if (entry.isFile()) {
                        const lowerName = entry.name.toLowerCase();
                        const isMarkdown = lowerName.endsWith('.md');
                        const isImage = /\.(png|jpe?g|gif|webp|svg)$/.test(lowerName);

                        if (isMarkdown || isImage) {
                            const stats = await fsPromises.stat(fullPath);
                            items.push({
                                id,
                                type: isMarkdown ? 'file' : 'image', // custom 'image' type for sidebar
                                parentId,
                                title: entry.name,
                                lastModified: stats.mtimeMs,
                                fsPath: fullPath,
                                // Content is loaded lazily to save memory
                            });
                        }
                    }
                }
            }

            try {
                await scan(dirPath);
                return items;
            } catch (err) {
                console.error('Failed to read directory:', err);
                return null;
            }
        },

        readFile: async (filePath) => {
            try {
                return await fsPromises.readFile(filePath, 'utf8');
            } catch (err) {
                console.error('Failed to read file:', err);
                return null;
            }
        },

        writeFile: async (filePath, content) => {
            try {
                await fsPromises.writeFile(filePath, content, 'utf8');
                return true;
            } catch (err) {
                console.error('Failed to write file:', err);
                return false;
            }
        },

        mkdir: async (dirPath) => {
            try {
                await fsPromises.mkdir(dirPath, { recursive: true });
                return true;
            } catch (err) {
                console.error('Failed to create folder:', err);
                return false;
            }
        },

        deleteItem: async (itemPath) => {
            try {
                const stat = await fsPromises.stat(itemPath);
                if (stat.isDirectory()) {
                    await fsPromises.rm(itemPath, { recursive: true, force: true });
                } else {
                    await fsPromises.unlink(itemPath);
                }
                return true;
            } catch (err) {
                console.error('Failed to delete item:', err);
                return false;
            }
        },

        renameItem: async (oldPath, newPath) => {
            try {
                await fsPromises.rename(oldPath, newPath);
                return true;
            } catch (err) {
                console.error('Failed to rename item:', err);
                return false;
            }
        }
    };
}

module.exports = { createFsHandlers };
