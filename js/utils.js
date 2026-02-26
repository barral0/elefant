/* =============================================================
   utils.js — Pure utility functions
   ============================================================= */

export const generateId = () => 'id-' + Math.random().toString(36).slice(2, 11);

/**
 * Escapes HTML special characters in a string.
 * Following OWASP recommendations for safe escaping.
 */
export const escapeHtml = str => {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[m]);
};

export const formatDate = ts => {
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const sortItems = arr =>
    [...arr].sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return b.lastModified - a.lastModified;
    });
