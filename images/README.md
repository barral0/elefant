# images/

This folder is for visual assets used in the **Elefant** project itself (screenshots, logos, etc.).

---

## How images work in Elefant

Elefant stores user-inserted images in **browser localStorage** as compressed data URLs — not as files on disk. This means:

- Images inserted via the editor are stored automatically in the browser
- They are referenced in your markdown as `![alt](img://id =600x)`
- They survive page refreshes but are **browser-local** — not tied to this folder
- Clearing browser data removes stored images

## Backing up images

To back up images embedded in notes, **download the note** (`Ctrl+D`) and keep the `.md` file. Note that image data URLs are not included in the `.md` export — only the `img://id` reference is.

For portable notes with images, consider linking to externally hosted images instead:

```markdown
![My image](https://your-server.com/path/to/image.png)
```

## Project assets

| File | Purpose |
|---|---|
| `screenshot.png` | Screenshot used in README.md |
