/* =============================================================
   files.js — File and folder CRUD operations
   ============================================================= */
import { state } from './state.js';
import { generateId } from './utils.js';
import { persist, autoSave } from './persistence.js';
import { renderSidebar, loadActiveItem } from './render.js';
import { t } from './i18n.js';

const noteTitleInput = document.getElementById('note-title');

// ── Accessors ────────────────────────────────────────────────
export const getItem = id => state.items.find(i => i.id === id);
export const getActiveItem = () => getItem(state.currentItemId) || state.items.find(i => i.type === 'file');
export const getActiveNote = () => {
    const item = getActiveItem();
    return item?.type === 'file' ? item : state.items.find(i => i.type === 'file');
};

// ── Create ───────────────────────────────────────────────────
export async function createNote(parentId = null) {
    const note = {
        id: generateId(), type: 'file', parentId,
        title: t('header.untitled') + '.md', content: '', lastModified: Date.now(),
    };

    if (window.electronAPI) {
        if (!note.parentId && state.items.some(i => i.id === 'fs-root')) {
            note.parentId = 'fs-root';
        }

        const parent = state.items.find(i => i.id === note.parentId);
        if (parent && parent.fsPath) {
            note.fsPath = await window.electronAPI.joinPath(parent.fsPath, note.title);
            await window.electronAPI.writeFile(note.fsPath, note.content);
        }
    }

    await finalizeItemCreation(note);
}

export async function createFolder() {
    const folder = {
        id: generateId(), type: 'folder', parentId: null,
        title: t('sidebar.new_folder'), isOpen: true, lastModified: Date.now(),
    };

    if (window.electronAPI) {
        const root = state.items.find(i => i.id === 'fs-root');
        if (root && root.fsPath) {
            folder.parentId = 'fs-root';
            folder.fsPath = await window.electronAPI.joinPath(root.fsPath, folder.title);
            await window.electronAPI.mkdir(folder.fsPath);
        }
    }

    await finalizeItemCreation(folder);
}

async function finalizeItemCreation(item) {
    state.items.push(item);
    state.currentItemId = item.id;

    if (item.type === 'file') {
        await loadActiveItem();
    } else {
        autoSave();
        noteTitleInput.value = item.title;
    }

    renderSidebar();
    noteTitleInput.focus();
    noteTitleInput.select();
}

// ── Delete ───────────────────────────────────────────────────
export async function deleteCurrentItem() {
    const item = getActiveItem();
    if (!item) return;

    const isFolder = item.type === 'folder';
    const msg = isFolder
        ? t('msg.delete_folder', item.title)
        : t('msg.delete_note', item.title);

    if (!confirm(msg)) return;

    if (window.electronAPI && item.fsPath) {
        if (item.id === 'fs-root') return; // protect root
        await window.electronAPI.deleteItem(item.fsPath);
    }

    if (isFolder) {
        const toDelete = collectDescendants(item.id);
        state.items = state.items.filter(i => !toDelete.has(i.id));
    } else {
        if (state.items.filter(i => i.type === 'file').length <= 1) {
            alert(t('msg.cannot_delete_last'));
            return;
        }
        state.items = state.items.filter(i => i.id !== item.id);
    }

    const nextFile = state.items.find(i => i.type === 'file');
    state.currentItemId = nextFile?.id ?? null;
    await loadActiveItem();
    renderSidebar();
    autoSave();
}

function collectDescendants(folderId) {
    const ids = new Set([folderId]);
    const walk = pid => state.items.filter(i => i.parentId === pid).forEach(child => {
        ids.add(child.id);
        if (child.type === 'folder') walk(child.id);
    });
    walk(folderId);
    return ids;
}

// ── Move ─────────────────────────────────────────────────────
export async function moveItem(itemId, targetParentId) {
    const item = getItem(itemId);
    if (!item) return;
    if (item.type === 'folder' && isDescendantOf(targetParentId, itemId)) return;

    if (window.electronAPI && item.fsPath) {
        const targetParent = getItem(targetParentId);
        if (targetParent && targetParent.fsPath) {
            const newFsPath = await window.electronAPI.joinPath(targetParent.fsPath, item.title);
            await window.electronAPI.renameItem(item.fsPath, newFsPath);
            item.fsPath = newFsPath;
            // Descendants will need recalculation, but to keep simple we re-read the directory 
            // naturally relying on next boot or they stay bound to memory.
        }
    }

    item.parentId = targetParentId;
    item.lastModified = Date.now();
    autoSave();
    renderSidebar();
}

function isDescendantOf(potentialChildId, ancestorId) {
    if (!potentialChildId) return false;
    if (potentialChildId === ancestorId) return true;
    const parent = getItem(potentialChildId);
    return parent ? isDescendantOf(parent.parentId, ancestorId) : false;
}

// ── Download ─────────────────────────────────────────────────
export function downloadNote() {
    const note = getActiveNote();
    if (!note) return;
    const blob = new Blob([note.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: note.title });
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
}
