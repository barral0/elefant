const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { createFsHandlers } = require('./fs-handlers');

const fsPromises = fs.promises;
const handlers = createFsHandlers(fsPromises, path);

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: 'Elefant',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        backgroundColor: '#1e1e24',
        autoHideMenuBar: true,
        frame: false, // frameless window to unite controls
    });

    // Remove the default toolbar menu completely
    mainWindow.setMenu(null);

    // We serve exactly the same index.html
    mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// ── IPC Listeners for Window Controls ──────────────────────────

ipcMain.handle('window:minimize', () => {
    if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('window:maximize', () => {
    if (!mainWindow) return;
    if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow.maximize();
    }
});

ipcMain.handle('window:close', () => {
    if (mainWindow) mainWindow.close();
});

// ── IPC Listeners for Local FS ─────────────────────────────────

// Utility path join
ipcMain.handle('fs:joinPath', (_, ...parts) => handlers.joinPath(...parts));

// 1. Open Directory Picker dialog
ipcMain.handle('dialog:openDirectory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    if (canceled || filePaths.length === 0) return null;
    return filePaths[0];
});

// 2. Read all files in a directory (recursive) looking for .md files
ipcMain.handle('fs:readDirectory', (_, dirPath) => handlers.readDirectory(dirPath));

// 3. Read a specific file's content
ipcMain.handle('fs:readFile', (_, filePath) => handlers.readFile(filePath));

// 4. Save file to disk
ipcMain.handle('fs:writeFile', (_, filePath, content) => handlers.writeFile(filePath, content));

// 5. Create new folder
ipcMain.handle('fs:mkdir', (_, dirPath) => handlers.mkdir(dirPath));

// 6. Delete file or folder
ipcMain.handle('fs:delete', (_, itemPath) => handlers.deleteItem(itemPath));

// 7. Rename file or folder
ipcMain.handle('fs:rename', (_, oldPath, newPath) => handlers.renameItem(oldPath, newPath));
