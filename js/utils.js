/* =============================================================
   utils.js — Pure utility functions
   ============================================================= */

export const generateId = () => 'id-' + Math.random().toString(36).slice(2, 11);

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

export const hslToHex = hsl => {
    const [h, s, l] = hsl.split(',').map(v => parseFloat(v));
    const a = s / 100, ll = l / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const c = a * Math.min(ll, 1 - ll);
        return ll - c * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    return '#' + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
};
