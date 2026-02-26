
import assert from 'node:assert';
import { test } from 'node:test';

// Mock DOM
const mockStyle = {};
const mockDataset = {};

// We need a way to reset mocks
function resetMocks() {
    for (const key in mockStyle) delete mockStyle[key];
    for (const key in mockDataset) delete mockDataset[key];
}

global.document = {
    documentElement: {
        dataset: mockDataset,
        style: {
            setProperty: (key, val) => { mockStyle[key] = val; }
        }
    },
    getElementById: (id) => {
        // Return dummy element for IDs to avoid crash on top-level execution
        return {
            hidden: false,
            addEventListener: () => {},
            querySelectorAll: () => [],
            classList: { toggle: () => {}, remove: () => {} },
            value: '',
            closest: () => null,
            dataset: {},
            style: {},
            textContent: ''
        };
    },
    querySelectorAll: () => [],
    title: ''
};

global.localStorage = {
    getItem: () => '{}',
    setItem: () => {}
};

global.window = {};

// We use a dynamic import in the test
test('applyTheme sets CSS variables on root', async () => {
    // Re-import to ensure fresh module state if needed, though ES modules are cached.
    // Since we are not changing the module source in the test loop, one import is fine.
    const { applyTheme } = await import('../js/theme.js');

    resetMocks();

    const theme = {
        mode: 'light',
        accent: '200,50%,50%',
        editorFont: 'Roboto',
        fontSize: 18,
        lineHeight: 1.6
    };

    applyTheme(theme);

    assert.strictEqual(mockDataset.theme, 'light');
    assert.strictEqual(mockStyle['--accent'], 'hsl(200,50%,50%)');
    assert.strictEqual(mockStyle['--font-mono'], 'Roboto');

    // Updated expectations
    assert.strictEqual(mockStyle['--editor-font-size'], '18px');
    assert.strictEqual(mockStyle['--editor-line-height'], 1.6);
});
