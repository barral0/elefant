# Changelog

All notable changes to Emerald are documented here.

## [Unreleased]

## [1.0.0] — 2026-02-26

### Added
- Markdown editor with live side-by-side preview
- Folder organiser with drag & drop
- Right-click context menu on file browser (rename, delete)
- Right-click context menu in text editor (bold, italic, code, link, image)
- App menu (⋮) consolidating all toolbar actions
- Image insertion via button, paste (`Ctrl+V`), and drag & drop
- Image resize modal — choose display width and storage quality
- `img://id` custom markdown syntax keeping the editor clean
- Theme editor — dark/light mode, 7 accent swatches + custom colour picker
- Editor font, font size (12–20px), and line height controls
- Keyboard shortcuts help modal (open with `?`)
- `Ctrl+B / I / \`` formatting shortcuts
- `Ctrl+S` manual save · `Ctrl+D` download as `.md`
- `Esc` dismisses all open menus and modals
- Modular JS architecture (ES modules)
- Modular CSS architecture (tokens, layout, components)
- Docker + nginx setup, port 8095
- Security headers via nginx (`X-Frame-Options`, `nosniff`, etc.)
- Log rotation in Docker Compose
