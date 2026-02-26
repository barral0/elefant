import { describe, it, before, after, mock } from 'node:test';
import assert from 'node:assert';

describe('Internationalization (i18n)', async () => {
    let i18n;
    let localStorageMock = {};
    let documentMock = {};

    before(async () => {
        // Mock localStorage
        global.localStorage = {
            getItem: (key) => localStorageMock[key] || null,
            setItem: (key, value) => { localStorageMock[key] = value; },
            removeItem: (key) => { delete localStorageMock[key]; },
            clear: () => { localStorageMock = {}; }
        };

        // Mock document
        global.document = {
            title: '',
            querySelectorAll: (selector) => [],
            createElement: (tag) => ({ tagName: tag.toUpperCase(), style: {} })
        };

        // Mock Node types
        global.Node = {
            TEXT_NODE: 3
        };

        // Import module after mocks are set
        i18n = await import('../js/i18n.js');
    });

    after(() => {
        delete global.localStorage;
        delete global.document;
        delete global.Node;
    });

    describe('t(key, ...args)', () => {
        it('should return the correct translation for a known key (en)', () => {
            // Default is 'en'
            assert.strictEqual(i18n.t('app.title'), 'Elefant — Markdown Editor');
        });

        it('should interpolate arguments correctly', () => {
            const noteName = 'My Note';
            const expected = `Delete note "${noteName}"?`;
            assert.strictEqual(i18n.t('msg.delete_note', noteName), expected);
        });

        it('should return the key itself if missing in both current and fallback languages', () => {
            const missingKey = 'non.existent.key';
            assert.strictEqual(i18n.t(missingKey), missingKey);
        });
    });

    describe('setLang(lang)', () => {
        it('should update the current language and persist to localStorage', () => {
            i18n.setLang('es');
            assert.strictEqual(i18n.getLang(), 'es');
            assert.strictEqual(localStorageMock['app-lang'], 'es');
        });

        it('should return translated strings for the new language', () => {
            // After setting to 'es' in previous test
            assert.strictEqual(i18n.t('app.title'), 'Elefant — Editor Markdown');
            assert.strictEqual(i18n.t('sidebar.notes'), 'Notas');
        });

        it('should not change language if the requested language is not supported', () => {
            const current = i18n.getLang();
            i18n.setLang('fr'); // 'fr' is not in TRANSLATIONS
            assert.strictEqual(i18n.getLang(), current);
        });
    });

    describe('applyTranslations()', () => {
        it('should update document.title', () => {
            i18n.setLang('en');
            // Mock document title setter/getter logic if needed, but the function sets it directly
            // We need to verify the side effect on document.title
            i18n.applyTranslations();
            assert.strictEqual(document.title, 'Elefant — Markdown Editor');
        });

        it('should update elements with data-i18n', () => {
            const el = {
                tagName: 'SPAN',
                dataset: { i18n: 'sidebar.notes' },
                textContent: '',
                children: [],
                childNodes: []
            };

            // Mock querySelectorAll to return our element for [data-i18n]
            const originalQSA = document.querySelectorAll;
            document.querySelectorAll = (selector) => {
                if (selector === '[data-i18n]') return [el];
                return [];
            };

            i18n.applyTranslations();
            assert.strictEqual(el.textContent, 'Notes');

            // Restore QSA
            document.querySelectorAll = originalQSA;
        });

        it('should update input placeholders with data-i18n-placeholder', () => {
            const el = {
                tagName: 'INPUT',
                dataset: { i18nPlaceholder: 'header.untitled' },
                placeholder: ''
            };

             const originalQSA = document.querySelectorAll;
            document.querySelectorAll = (selector) => {
                if (selector === '[data-i18n-placeholder]') return [el];
                return [];
            };

            i18n.applyTranslations();
            assert.strictEqual(el.placeholder, 'Untitled');

            document.querySelectorAll = originalQSA;
        });

        it('should update title and aria-label with data-i18n-title', () => {
             const el = {
                tagName: 'BUTTON',
                dataset: { i18nTitle: 'sidebar.new_folder' },
                title: '',
                attributes: {},
                setAttribute: function(k, v) { this.attributes[k] = v; }
            };

             const originalQSA = document.querySelectorAll;
            document.querySelectorAll = (selector) => {
                if (selector === '[data-i18n-title]') return [el];
                return [];
            };

            i18n.applyTranslations();
            assert.strictEqual(el.title, 'New Folder');
            assert.strictEqual(el.attributes['aria-label'], 'New Folder');

            document.querySelectorAll = originalQSA;
        });
    });
});
