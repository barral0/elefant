# Markdown Cheatsheet

A quick reference for all common Markdown syntax.

---

## Headings

```
# H1 — Page title
## H2 — Section
### H3 — Sub-section
#### H4
```

---

## Emphasis

```
**bold text**
*italic text*
~~strikethrough~~
**_bold italic_**
```

**bold text** · *italic text* · ~~strikethrough~~

---

## Lists

**Unordered:**
```
- Item one
- Item two
  - Nested item
```

**Ordered:**
```
1. First
2. Second
3. Third
```

---

## Links

```
[Link text](https://example.com)
[Link with title](https://example.com "Tooltip text")
```

---

## Images

Standard:
```
![Alt text](https://example.com/image.png)
```

Emerald with display width (after inserting via modal):
```
![Alt text](img://id =600x)
```

---

## Code

Inline: `` `code` ``

Block:
````
```javascript
const greeting = "Hello, world!";
console.log(greeting);
```
````

---

## Blockquote

```
> This is a blockquote.
> It can span multiple lines.
```

> This is a blockquote.

---

## Tables

```
| Column 1 | Column 2 | Column 3 |
|---|---|---|
| Cell A   | Cell B   | Cell C   |
| Cell D   | Cell E   | Cell F   |
```

| Column 1 | Column 2 | Column 3 |
|---|---|---|
| Cell A   | Cell B   | Cell C   |

---

## Horizontal Rule

```
---
```

---

## Task List

```
- [x] Completed task
- [ ] Pending task
- [ ] Another task
```

- [x] Completed task
- [ ] Pending task

---

## Escape Characters

Prefix any Markdown character with `\` to render it literally:

```
\*not italic\*
\# not a heading
\`not code\`
```
