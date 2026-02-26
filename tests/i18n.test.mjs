import { test, describe, it, before, after } from 'node:test';
import assert from 'node:assert';

// Mock localStorage
const localStorageMock = {
    store: {},
    getItem(key) { return this.store[key] || null; },
    setItem(key, value) { this.store[key] = String(value); },
    removeItem(key) { delete this.store[key]; },
    clear() { this.store = {}; }
};

// Mock document
const documentMock = {
    title: '',
    querySelectorAll: () => [],
    body: { classList: { add: () => {}, remove: () => {} } }
};

// Apply mocks to global scope before importing the module
global.localStorage = localStorageMock;
global.document = documentMock;
global.window = {}; // Some code might check for window

// Dynamic import to ensure mocks are set before module execution
const { t, setLang, getLang, TRANSLATIONS } = await import('../js/i18n.js');

describe('i18n.js', () => {

    before(() => {
        // Reset state before tests
        localStorage.clear();
        setLang('en');
    });

    it('should return correct translation for English', () => {
        assert.strictEqual(t('app.title'), 'Elefant — Markdown Editor');
        assert.strictEqual(t('sidebar.notes'), 'Notes');
    });

    it('should fallback to key if translation is missing', () => {
        const key = 'non.existent.key';
        assert.strictEqual(t(key), key);
    });

    it('should switch language correctly', () => {
        setLang('pt');
        assert.strictEqual(getLang(), 'pt');
        assert.strictEqual(t('sidebar.notes'), 'Notas');

        setLang('es');
        assert.strictEqual(getLang(), 'es');
        assert.strictEqual(t('sidebar.notes'), 'Notas');
        assert.strictEqual(t('sidebar.new_folder'), 'Nueva Carpeta');
    });

    it('should fallback to English if key is missing in current language', () => {
        // Temporarily remove a key from 'es' to test fallback
        const original = TRANSLATIONS['es']['app.title'];
        delete TRANSLATIONS['es']['app.title'];

        setLang('es');
        // Should fallback to English 'Elefant — Markdown Editor'
        assert.strictEqual(t('app.title'), 'Elefant — Markdown Editor');

        // Restore
        TRANSLATIONS['es']['app.title'] = original;
    });

    it('should interpolate single argument', () => {
        setLang('en');
        // 'msg.delete_note': 'Delete note "{0}"?'
        assert.strictEqual(t('msg.delete_note', 'My Note'), 'Delete note "My Note"?');
    });

    it('should interpolate multiple arguments', () => {
        // We don't have a multi-arg string in the current dictionary, so let's fake one for the test
        TRANSLATIONS['en']['test.multi'] = 'Hello {0} and {1}';

        assert.strictEqual(t('test.multi', 'Alice', 'Bob'), 'Hello Alice and Bob');

        // Clean up
        delete TRANSLATIONS['en']['test.multi'];
    });

    it('should handle numeric arguments in interpolation', () => {
         TRANSLATIONS['en']['test.number'] = 'Count: {0}';
         assert.strictEqual(t('test.number', 123), 'Count: 123');
         delete TRANSLATIONS['en']['test.number'];
    });
});
