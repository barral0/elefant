const path = require('path');

let allowedDir = null;

function setAllowedDir(dirPath) {
    if (!dirPath) {
        allowedDir = null;
        return;
    }
    allowedDir = path.resolve(dirPath);
}

function getAllowedDir() {
    return allowedDir;
}

function isSafePath(targetPath) {
    if (!allowedDir) return false;
    if (!targetPath) return false;

    // Resolve the target path to an absolute path
    const resolvedPath = path.resolve(targetPath);

    // Check if the resolved path starts with the allowed directory
    const relative = path.relative(allowedDir, resolvedPath);

    // If the relative path starts with '..', it's outside the allowed directory
    // If the relative path is absolute (on Windows across drives), it's unsafe
    return !relative.startsWith('..') && !path.isAbsolute(relative);
}

module.exports = {
    setAllowedDir,
    getAllowedDir,
    isSafePath
};
