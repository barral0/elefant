// tests/test_images.mjs

import { strict as assert } from 'node:assert';
import { EventEmitter } from 'node:events';

// --- Mock DOM Environment ---

// Mock Editor Element
class MockEditor extends EventEmitter {
    constructor() {
        super();
        this.value = 'Hello World';
        this.selectionStart = 5;
        this.selectionEnd = 5;
        this.focused = false;
        this.events = [];
    }

    focus() {
        this.focused = true;
    }

    setRangeText(text, start, end, mode) {
        this.events.push({ type: 'setRangeText', text, start, end, mode });
        // Simple mock implementation
        const before = this.value.slice(0, start);
        const after = this.value.slice(end);
        this.value = before + text + after;

        if (mode === 'end') {
            this.selectionStart = start + text.length;
            this.selectionEnd = start + text.length;
        }
    }

    dispatchEvent(event) {
        this.events.push({ type: 'dispatchEvent', eventType: event.type });
        return true;
    }
}

const mockEditor = new MockEditor();

// Mock Document
global.document = {
    getElementById: (id) => {
        if (id === 'editor') return mockEditor;
        // Mock other elements accessed by images.js top-level code
        return {
            addEventListener: () => {},
            hidden: false,
            style: {},
            src: '',
            value: '',
            focus: () => {}
        };
    },
    execCommand: (command, showUI, value) => {
        // This is the deprecated function we are testing removal of.
        // For the purpose of the test, we'll return false to simulate failure
        // or true to simulate success if we want to test the old path.
        // But since we want to remove it, we'll verify behavior without it.
        return false;
    }
};

// Mock Window/Global
global.window = {};
global.Event = class Event {
    constructor(type) {
        this.type = type;
    }
};
global.URL = {
    createObjectURL: () => 'blob:mock',
    revokeObjectURL: () => {}
};
global.Image = class Image {
    constructor() {}
};
global.localStorage = {
    getItem: () => null,
    setItem: () => {}
};

// --- Import Module Under Test ---
// We use a dynamic import because we need the mocks set up first
const { insertAtCursor } = await import('../js/images.js');

// --- Test Cases ---

console.log('Running tests for insertAtCursor...');

// Test 1: Insert text at cursor
mockEditor.value = 'Hello World';
mockEditor.selectionStart = 5;
mockEditor.selectionEnd = 5;
mockEditor.events = []; // Reset events

insertAtCursor(' Cruel');

// Verify setRangeText was called
const setRangeCall = mockEditor.events.find(e => e.type === 'setRangeText');
assert.ok(setRangeCall, 'setRangeText should be called');
assert.equal(setRangeCall.text, ' Cruel');
assert.equal(setRangeCall.start, 5);
assert.equal(setRangeCall.end, 5);
assert.equal(setRangeCall.mode, 'end');

// Verify input event dispatched
const dispatchCall = mockEditor.events.find(e => e.type === 'dispatchEvent' && e.eventType === 'input');
assert.ok(dispatchCall, 'input event should be dispatched');

// Verify editor value updated (by our mock implementation)
assert.equal(mockEditor.value, 'Hello Cruel World');

console.log('✅ Test 1 Passed: Insert text at cursor');

// Test 2: Replace selection
mockEditor.value = 'Hello World';
mockEditor.selectionStart = 0;
mockEditor.selectionEnd = 5;
mockEditor.events = [];

insertAtCursor('Hi');

const replaceCall = mockEditor.events.find(e => e.type === 'setRangeText');
assert.ok(replaceCall, 'setRangeText should be called');
assert.equal(replaceCall.text, 'Hi');
assert.equal(replaceCall.start, 0);
assert.equal(replaceCall.end, 5);

assert.equal(mockEditor.value, 'Hi World');

console.log('✅ Test 2 Passed: Replace selection');

console.log('All tests passed!');
