import { test } from 'node:test';
import assert from 'node:assert';
import { ICONS } from '../js/icons.js';

test('ICONS object contains expected SVGs', () => {
    assert.ok(ICONS.FOLDER, 'ICONS.FOLDER should be defined');
    assert.ok(ICONS.IMAGE, 'ICONS.IMAGE should be defined');
    assert.ok(ICONS.FILE, 'ICONS.FILE should be defined');

    assert.ok(ICONS.FOLDER.includes('<svg'), 'ICONS.FOLDER should contain <svg>');
    assert.ok(ICONS.IMAGE.includes('<svg'), 'ICONS.IMAGE should contain <svg>');
    assert.ok(ICONS.FILE.includes('<svg'), 'ICONS.FILE should contain <svg>');
});

test('js/render.js imports without error (mocking DOM)', async () => {
    // Mock global objects required by js/render.js
    global.document = {
        getElementById: (id) => {
            return {
                style: {},
                addEventListener: () => {},
                appendChild: () => {},
            }; // simple mock
        },
        createDocumentFragment: () => ({ appendChild: () => {} }),
        createElement: (tag) => ({
            className: '',
            classList: { add: () => {}, remove: () => {} },
            appendChild: () => {},
            addEventListener: () => {},
            dataset: {},
            style: {},
        }),
        addEventListener: () => {},
        querySelector: () => ({ addEventListener: () => {} }),
    };

    global.window = {
        electronAPI: null,
        innerWidth: 1024,
        innerHeight: 768,
        addEventListener: () => {},
    };

    global.localStorage = {
        getItem: () => null,
        setItem: () => {},
    };

    // Mock other globals used
    global.marked = { parse: (str) => str };
    global.DOMPurify = { sanitize: (str) => str };

    // Dynamically import to ensure mocks are in place
    try {
        const render = await import('../js/render.js');
        assert.ok(render.renderSidebar, 'renderSidebar should be exported');
        assert.ok(render.loadActiveItem, 'loadActiveItem should be exported');
    } catch (err) {
        assert.fail(`Failed to import js/render.js: ${err.message}`);
    }
});
