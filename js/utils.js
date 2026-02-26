/* =============================================================
   utils.js — Pure utility functions
   ============================================================= */

export const generateId = () => {
    const array = new Uint8Array(6);
    crypto.getRandomValues(array);
    return 'id-' + Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
};

export const escapeHtml = str =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const formatDate = ts => {
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const sortItems = arr =>
    [...arr].sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return b.lastModified - a.lastModified;
    });
