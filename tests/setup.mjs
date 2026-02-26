export function createMockBrowser() {
    global.window = {
        electronAPI: null,
        confirm: () => true,
        alert: () => {},
        addEventListener: () => {}, // Mock window.addEventListener
    };
    global.document = {
        getElementById: (id) => {
            if (id === 'save-status') {
                return {
                    className: '',
                    textContent: '',
                    style: {}
                };
            }
            if (id === 'file-list') {
                return {
                    innerHTML: '',
                    appendChild: () => {},
                    children: []
                };
            }
            if (id === 'editor') {
                 return {
                    value: '',
                    style: {},
                    offsetWidth: 0,
                    addEventListener: () => {}, // Mock addEventListener for editor
                 }
            }
             if (id === 'preview') {
                 return {
                    innerHTML: '',
                    style: {},
                    offsetWidth: 0,
                 }
            }
            if (id === 'word-count') {
                 return {
                    textContent: '',
                 }
            }
            if (id === 'note-title') {
                 return {
                    value: '',
                    focus: () => {},
                    select: () => {},
                 }
            }
            // Generic mock for other elements
            return {
                style: {},
                value: '',
                innerHTML: '',
                textContent: '',
                appendChild: () => {},
                addEventListener: () => {},
                hidden: false, // For modals
            };
        },
        createElement: (tag) => {
             return {
                style: {},
                classList: {
                    add: () => {},
                    remove: () => {},
                },
                dataset: {},
                appendChild: () => {},
                addEventListener: () => {},
                innerHTML: '',
             }
        },
        createDocumentFragment: () => ({
            appendChild: () => {}
        }),
        body: {
            appendChild: () => {},
            removeChild: () => {},
        },
        querySelectorAll: () => [], // Mock querySelectorAll
        activeElement: { tagName: 'BODY' }, // Mock activeElement
        addEventListener: () => {}, // Mock document.addEventListener
    };
    global.localStorage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {}
    };
    global.confirm = () => true;
    global.alert = () => {};
    global.DOMPurify = {
        sanitize: (html) => html
    };
    global.marked = {
        parse: (md) => md
    };
    global.Node = {
        TEXT_NODE: 3
    };
}
