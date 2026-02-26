const { contextBridge, ipcRenderer } = require('electron');

// Expose these IPC functions to the renderer process as `window.electronAPI`
contextBridge.exposeInMainWorld('electronAPI', {
    openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
    readDirectory: (dirPath) => ipcRenderer.invoke('fs:readDirectory', dirPath),
    readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
    writeFile: (filePath, content) => ipcRenderer.invoke('fs:writeFile', filePath, content),
    mkdir: (dirPath) => ipcRenderer.invoke('fs:mkdir', dirPath),
    deleteItem: (itemPath) => ipcRenderer.invoke('fs:delete', itemPath),
    renameItem: (oldPath, newPath) => ipcRenderer.invoke('fs:rename', oldPath, newPath)
});
