import { describe, it, before, after, beforeEach, mock } from 'node:test';
import assert from 'node:assert';

describe('persistence.js', () => {
    let originalLocalStorage;
    let localStorageMock;
    let originalDocument;
    let documentMock;
    let persist;
    let state;

    before(async () => {
        // Mock global localStorage
        originalLocalStorage = global.localStorage;
        localStorageMock = {
            store: {},
            setItem: mock.fn((key, value) => {
                localStorageMock.store[key] = value.toString();
            }),
            getItem: mock.fn((key) => {
                return localStorageMock.store[key] || null;
            }),
            clear: mock.fn(() => {
                localStorageMock.store = {};
            })
        };
        global.localStorage = localStorageMock;

        // Mock global document
        originalDocument = global.document;
        documentMock = {
            getElementById: mock.fn((id) => {
                return {
                    id,
                    className: '',
                    textContent: '',
                    style: {}
                };
            })
        };
        global.document = documentMock;

        // Dynamic import to load module AFTER mocks are set
        const persistenceModule = await import('../js/persistence.js');
        const stateModule = await import('../js/state.js');
        persist = persistenceModule.persist;
        state = stateModule.state;
    });

    after(() => {
        // Restore globals
        global.localStorage = originalLocalStorage;
        global.document = originalDocument;
    });

    beforeEach(() => {
        // Reset mock store and call counts
        localStorageMock.store = {};
        localStorageMock.setItem.mock.resetCalls();
    });

    describe('persist', () => {
        it('should save state.items to localStorage', () => {
            state.items = [{ id: '1', title: 'Test Note' }];
            persist();

            const call = localStorage.setItem.mock.calls.find(c => c.arguments[0] === 'app-items');
            assert.ok(call, 'localStorage.setItem should be called with "app-items"');
            assert.strictEqual(call.arguments[1], JSON.stringify(state.items));
        });

        it('should save state.currentItemId to localStorage', () => {
            state.currentItemId = '123';
            persist();

            const call = localStorage.setItem.mock.calls.find(c => c.arguments[0] === 'app-current-item');
            assert.ok(call, 'localStorage.setItem should be called with "app-current-item"');
            assert.strictEqual(call.arguments[1], '123');
        });

        it('should save state.imageStore to localStorage', () => {
            state.imageStore = { 'img1': 'data:image/png;base64,...' };
            persist();

            const call = localStorage.setItem.mock.calls.find(c => c.arguments[0] === 'app-images');
            assert.ok(call, 'localStorage.setItem should be called with "app-images"');
            assert.strictEqual(call.arguments[1], JSON.stringify(state.imageStore));
        });
    });
});
