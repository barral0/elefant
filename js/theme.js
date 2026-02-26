/* =============================================================
   theme.js — Theme system: apply, persist, modal controls
   ============================================================= */

const themeModalOverlay = document.getElementById('theme-modal-overlay');
const themeModalClose = document.getElementById('theme-modal-close');
const modeToggle = document.getElementById('mode-toggle');
const accentSwatches = document.getElementById('accent-swatches');
const accentCustom = document.getElementById('accent-custom');
const editorFontSelect = document.getElementById('editor-font-select');
const editorFontSizeEl = document.getElementById('editor-font-size');
const editorLineHeightEl = document.getElementById('editor-line-height');
const fontSizeVal = document.getElementById('font-size-val');
const lineHeightVal = document.getElementById('line-height-val');
const themeResetBtn = document.getElementById('theme-reset-btn');
const langSelect = document.getElementById('lang-select');

import { setLang, getLang } from './i18n.js';
import { hexToHsl } from './utils.js';

const THEME_DEFAULTS = {
    mode: 'dark',
    accent: '250,100%,65%',
    editorFont: "'Fira Code', monospace",
    fontSize: 15,
    lineHeight: 1.75,
};

export let theme = { ...THEME_DEFAULTS, ...JSON.parse(localStorage.getItem('app-theme') || '{}') };

// ── Apply ────────────────────────────────────────────────────
export function applyTheme(t = theme) {
    const root = document.documentElement;
    root.dataset.theme = t.mode;
    root.style.setProperty('--accent', `hsl(${t.accent})`);
    root.style.setProperty('--accent-glow', `hsla(${t.accent}, 0.2)`);
    root.style.setProperty('--font-mono', t.editorFont);
    const editor = document.getElementById('editor');
    editor.style.fontSize = t.fontSize + 'px';
    editor.style.lineHeight = t.lineHeight;
}

export function saveTheme() {
    localStorage.setItem('app-theme', JSON.stringify(theme));
}

// ── Sync UI controls to current theme ────────────────────────
function syncThemeUI() {
    modeToggle.querySelectorAll('.mode-btn').forEach(btn =>
        btn.classList.toggle('active', btn.dataset.mode === theme.mode));
    accentSwatches.querySelectorAll('.swatch[data-hsl]').forEach(s =>
        s.classList.toggle('active', s.dataset.hsl === theme.accent));
    editorFontSelect.value = theme.editorFont;
    editorFontSizeEl.value = theme.fontSize;
    editorLineHeightEl.value = theme.lineHeight;
    fontSizeVal.textContent = theme.fontSize + 'px';
    lineHeightVal.textContent = parseFloat(theme.lineHeight).toFixed(2);
    if (langSelect) langSelect.value = getLang();
    try { accentCustom.value = hslToHex(theme.accent); } catch { }
}

// ── Modal ────────────────────────────────────────────────────
export function openThemeModal() { themeModalOverlay.hidden = false; syncThemeUI(); }
export function closeThemeModal() { themeModalOverlay.hidden = true; }

themeModalClose.addEventListener('click', closeThemeModal);
themeModalOverlay.addEventListener('click', e => {
    if (e.target === themeModalOverlay) closeThemeModal();
});

// ── Controls ─────────────────────────────────────────────────
modeToggle.addEventListener('click', e => {
    const btn = e.target.closest('.mode-btn');
    if (!btn) return;
    theme.mode = btn.dataset.mode;
    applyTheme(); saveTheme(); syncThemeUI();
});

accentSwatches.addEventListener('click', e => {
    const sw = e.target.closest('.swatch[data-hsl]');
    if (!sw) return;
    theme.accent = sw.dataset.hsl;
    applyTheme(); saveTheme(); syncThemeUI();
});

accentCustom.addEventListener('input', e => {
    theme.accent = hexToHsl(e.target.value);
    accentSwatches.querySelectorAll('.swatch[data-hsl]').forEach(sw => sw.classList.remove('active'));
    applyTheme(); saveTheme();
});

editorFontSelect.addEventListener('change', () => {
    theme.editorFont = editorFontSelect.value;
    applyTheme(); saveTheme();
});

editorFontSizeEl.addEventListener('input', () => {
    theme.fontSize = parseInt(editorFontSizeEl.value, 10);
    fontSizeVal.textContent = theme.fontSize + 'px';
    applyTheme(); saveTheme();
});

editorLineHeightEl.addEventListener('input', () => {
    theme.lineHeight = parseFloat(editorLineHeightEl.value);
    lineHeightVal.textContent = theme.lineHeight.toFixed(2);
    applyTheme(); saveTheme();
});

themeResetBtn.addEventListener('click', () => {
    theme = { ...THEME_DEFAULTS };
    applyTheme(); saveTheme(); syncThemeUI();
});

if (langSelect) {
    langSelect.addEventListener('change', () => {
        setLang(langSelect.value);
    });
}

// ── Utility — HSL → Hex ──────────────────────────────────────
function hslToHex(hsl) {
    const [h, s, l] = hsl.split(',').map(v => parseFloat(v));
    const a = s / 100, ll = l / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const c = a * Math.min(ll, 1 - ll);
        return ll - c * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    return '#' + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
}
