/* =============================================================
   text-utils.js — Text manipulation utilities
   ============================================================= */

const editor = document.getElementById('editor');

export function insertAtCursor(text) {
    editor.focus();
    if (!document.execCommand('insertText', false, text)) {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        editor.setRangeText(text, start, end, 'end');
    }
    editor.dispatchEvent(new Event('input'));
}

export function wrapSelection(prefix, suffix = prefix, placeholder = '') {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const sel = editor.value.slice(start, end) || placeholder;
    insertAtCursor(prefix + sel + suffix);
}
