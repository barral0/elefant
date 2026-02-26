const fs = require('fs');
const fsPromises = fs.promises;

async function handleWriteFile(_, filePath, content) {
    try {
        await fsPromises.writeFile(filePath, content, 'utf8');
        return true;
    } catch (err) {
        console.error('Failed to write file:', err);
        return false;
    }
}

module.exports = { handleWriteFile };
