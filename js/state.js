/* =============================================================
   state.js — Shared application state
   ============================================================= */

const DEFAULT_CONTENT = `# Welcome to Elefant! 🐘

*(Português abaixo | Español abajo)*

Elefant is a minimalist, self-hosted Markdown editor designed for speed and simplicity. 

- **No accounts, no cloud:** Everything is stored directly in your browser's local storage.
- **Fast and Distraction-free:** The editor instantly renders your markdown with a live preview.
- **Customizable:** Click the \`⋮\` menu to change themes, fonts, and accent colors.
- **Image Support:** Paste (\`Ctrl+V\`) or drag & drop images straight into the editor. Try it!

To get started, explore the other sample notes in the sidebar, or click the **New Note** icon to create your own! 

---

# Bem-vindo(a) ao Elefant! 🐘

O Elefant é um editor Markdown minimalista e self-hosted (hospedado por você), focado em velocidade e simplicidade.

- **Sem contas, sem nuvem:** Tudo fica salvo diretamente no armazenamento local do seu navegador (localStorage).
- **Rápido e sem distrações:** O editor renderiza seu Markdown instantaneamente com pré-visualização em tempo real.
- **Personalizável:** Clique no menu \`⋮\` para mudar temas, fontes e cores de destaque.
- **Suporte a Imagens:** Cole (\`Ctrl+V\`) ou arraste e solte imagens direto no editor. Experimente!

Para começar, explore as outras notas de exemplo na barra lateral, ou clique no ícone **Nova Nota** para criar a sua!

---

# ¡Te damos la bienvenida a Elefant! 🐘

Elefant es un editor Markdown minimalista y "self-hosted" (autoalojado), diseñado para ser rápido y sencillo.

- **Sin cuentas ni la nube:** Todo se guarda de forma segura directamente en el almacenamiento local de tu navegador.
- **Rápido y sin distracciones:** El editor muestra tu código Markdown al instante con vista previa en vivo.
- **Personalizable:** Haz clic en el menú \`⋮\` para cambiar temas, colores y tipos de letra.
- **Soporte para Imágenes:** Pega (\`Ctrl+V\`) o arrastra y suelta imágenes directamente en el editor. ¡Pruébalo!

Para empezar, explora las demás notas de muestra en la barra lateral o haz clic en el icono de **Nueva Nota** para crear tu primera nota.
`;

const DEFAULT_ITEMS = [
    { id: 'folder-default', type: 'folder', parentId: null, title: 'Notes', isOpen: true, lastModified: Date.now() },
    { id: 'note-default', type: 'file', parentId: null, title: 'Welcome.md', content: DEFAULT_CONTENT, lastModified: Date.now() },
];

// ── Items ────────────────────────────────────────────────────
let _items = JSON.parse(localStorage.getItem('app-items')) || DEFAULT_ITEMS;

// Legacy migration — old 'app-notes' key
const _oldNotes = JSON.parse(localStorage.getItem('app-notes'));
if (_oldNotes && !localStorage.getItem('app-items')) {
    _items = _oldNotes.map(n => ({ ...n, type: 'file', parentId: null }));
}

// Optimization: O(1) Lookup Map
const _itemMap = new Map();

function syncMap(items) {
    _itemMap.clear();
    items.forEach(i => {
        if (i && i.id) _itemMap.set(i.id, i);
    });
}

function createProxy(items) {
    syncMap(items);
    return new Proxy(items, {
        get(target, prop, receiver) {
            // Trap mutating array methods to update the map ONCE after the operation completes.
            if (['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort'].includes(prop)) {
                return (...args) => {
                    const result = Array.prototype[prop].apply(target, args);
                    syncMap(target);
                    return result;
                };
            }
            return Reflect.get(target, prop, receiver);
        },
        set(target, prop, value, receiver) {
            const result = Reflect.set(target, prop, value, receiver);
            // Trap direct index assignment or length truncation
            if (prop === 'length' || !isNaN(prop)) {
                syncMap(target);
            }
            return result;
        },
        deleteProperty(target, prop) {
            const result = Reflect.deleteProperty(target, prop);
            if (!isNaN(prop)) {
                syncMap(target);
            }
            return result;
        }
    });
}

let _proxiedItems = createProxy(_items);

export const state = {
    get items() { return _proxiedItems; },
    set items(v) {
        _items = v;
        _proxiedItems = createProxy(_items);
    },

    getItemById(id) {
        return _itemMap.get(id);
    },

    currentItemId: localStorage.getItem('app-current-item') || _items.find(i => i.type === 'file')?.id,
    contextTargetId: null,
    imageStore: JSON.parse(localStorage.getItem('app-images')) || {},
};
