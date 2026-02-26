/* =============================================================
   images.js — Image insertion, resizing, and modal logic
   ============================================================= */
import { state } from './state.js';
import { generateId, resizeImage } from './utils.js';
import { persist } from './persistence.js';

const editor = document.getElementById('editor');
const imageModalOverlay = document.getElementById('image-modal-overlay');
const modalImgPreview = document.getElementById('modal-img-preview');
const modalImgAlt = document.getElementById('modal-img-alt');
const modalImgWidth = document.getElementById('modal-img-width');
const modalImgQuality = document.getElementById('modal-img-quality');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const modalInsertBtn = document.getElementById('modal-insert-btn');

let _pendingImageFile = null;

// ── Insert at cursor ─────────────────────────────────────────
export function insertAtCursor(text) {
    editor.focus();
    if (!document.execCommand('insertText', false, text)) {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        editor.setRangeText(text, start, end, 'end');
    }
    editor.dispatchEvent(new Event('input'));
}

// ── Modal open/close ─────────────────────────────────────────
export function openImageModal(file) {
    if (!file || !file.type.startsWith('image/')) return;
    _pendingImageFile = file;
    const objectUrl = URL.createObjectURL(file);
    modalImgPreview.src = objectUrl;
    modalImgPreview.onload = () => URL.revokeObjectURL(objectUrl);
    modalImgAlt.value = file.name.replace(/\.[^.]+$/, '');
    modalImgWidth.value = '';
    imageModalOverlay.hidden = false;
    modalImgAlt.focus();
}

export function closeImageModal() {
    imageModalOverlay.hidden = true;
    _pendingImageFile = null;
    modalImgPreview.src = '';
}

// ── Commit insert ─────────────────────────────────────────────
export async function commitImageInsert() {
    if (!_pendingImageFile) return;
    const maxEdge = parseInt(modalImgQuality.value, 10);
    const alt = modalImgAlt.value.trim() || 'image';
    const dispWidth = modalImgWidth.value.trim();

    const dataUrl = await resizeImage(_pendingImageFile, maxEdge);
    const imgId = generateId();
    state.imageStore[imgId] = dataUrl;
    persist();

    const sizeHint = dispWidth ? ` =${dispWidth}x` : '';
    insertAtCursor(`![${alt}](img://${imgId}${sizeHint})`);
    closeImageModal();
}

// ── Wire up modal events ──────────────────────────────────────
modalCancelBtn.addEventListener('click', closeImageModal);
modalInsertBtn.addEventListener('click', commitImageInsert);
imageModalOverlay.addEventListener('click', e => {
    if (e.target === imageModalOverlay) closeImageModal();
});
