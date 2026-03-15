# folio-editor

A paginated document editor for React/Next.js. Automatic page breaks, headers/footers, page numbers, print-ready output. Built on [TipTap](https://tiptap.dev).

> **Status**: Early development — Phase 2 in progress

## Features

- **Content-aware page breaks** — breaks fall between block elements, never mid-paragraph
- **Table splitting** — large tables split at row boundaries across pages with clean closing borders
- **Forced page breaks** — `PageBreak` node + `editor.commands.insertPageBreak()` (keyboard: `Cmd+Shift+Enter`)
- **Page state API** — `getPageInfo()`, `getCurrentPage()`, `getVisiblePage()`, `scrollToPage()`
- **Multiple page sizes**: A4, A3, A5, US Letter, Legal, Tabloid
- **Headers and footers** with custom render functions
- **Page numbers** — configurable position, alignment, format
- **Print support** — `Ctrl+P` output matches screen layout
- **Rich text**: bold, italic, underline, strikethrough, headings H1–H6
- **Lists**: ordered and unordered
- **Tables** with column resize
- **Zero interference** — no ProseMirror transactions, no clipboard interception, native undo/redo

## How It Works

Content flows in a single continuous ProseMirror document. The pagination plugin:

1. Measures all top-level block elements in the editor
2. Finds the last block that fully fits within each page's content area (tables are split at row boundaries)
3. Injects CSS `margin-bottom` (blocks) or `padding-bottom` (table rows) via a `<style>` in `<head>`, invisible to ProseMirror's MutationObserver
4. Renders per-page card backgrounds, gap bars, headers, footers, and page numbers as DOM overlays

This means scrolling, copy/paste, selection, and undo/redo all work natively.

## Install

```bash
npm install folio-editor
```

## Quick Start

```tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { PageDocument, FolioExtension, PageBreak } from 'folio-editor';

function Editor() {
  const editor = useEditor({
    extensions: [
      PageDocument,
      FolioExtension.configure({
        pageSize: 'A4',
        pageGap: 40,
        header: {
          enabled: true,
          height: 32,
          render: () => 'My Document',
        },
        pageNumber: {
          show: true,
          position: 'bottom',
          alignment: 'center',
        },
      }),
      PageBreak, // adds insertPageBreak command + Cmd+Shift+Enter
      StarterKit.configure({ document: false }),
    ],
    content: '<p>Start typing...</p>',
  });

  return <EditorContent editor={editor} />;
}
```

## Configuration

```ts
FolioExtension.configure({
  pageSize: 'A4',          // 'A3' | 'A4' | 'A5' | 'LETTER' | 'LEGAL' | 'TABLOID'
  margins: {
    top: 72,               // pixels
    bottom: 72,
    left: 72,
    right: 72,
  },
  header: {
    enabled: true,
    height: 40,
    render: () => 'Header text',
  },
  footer: {
    enabled: false,
    height: 40,
    render: () => 'Footer text',
  },
  pageNumber: {
    show: true,
    showTotal: true,        // "1 / 3" vs "1"
    showOnFirstPage: false,
    position: 'bottom',     // 'top' | 'bottom'
    alignment: 'center',    // 'left' | 'center' | 'right'
    format: (current, total) => `Page ${current} of ${total}`,
  },
  pageGap: 40,              // gap between visual pages (px)
  pageBreakBackground: '#e8e8e8',
});
```

## Page State API

```ts
import { getPageInfo, getActivePage, scrollToPage } from 'folio-editor';

// Total pages and positions
const info = getPageInfo(editor);
// → { pageCount: 3, pages: [{ index: 0, top: 0, height: 1123 }, ...] }

// Which page is active — choose your mode
getActivePage(editor, 'viewport');  // page in the viewport (default)
getActivePage(editor, 'cursor');    // page containing the text cursor

// Convenience aliases
getVisiblePage(editor);  // same as getActivePage(editor, 'viewport')
getCurrentPage(editor);  // same as getActivePage(editor, 'cursor')

// Scroll to a specific page (1-indexed)
scrollToPage(editor, 2);
```

The plugin fires a `foliopagechange` DOM event on the editor element after every repagination, so you can listen for updates:

```ts
editor.view.dom.addEventListener('foliopagechange', () => {
  console.log('Pages changed:', getPageInfo(editor));
});
```

## Page Sizes

| Name    | Dimensions         |
|---------|--------------------|
| A3      | 297 x 420 mm      |
| A4      | 210 x 297 mm      |
| A5      | 148 x 210 mm      |
| Letter  | 8.5 x 11 in       |
| Legal   | 8.5 x 14 in       |
| Tabloid | 11 x 17 in        |

## Roadmap

- [x] Phase 1: Page layout, pagination, headers/footers, page numbers, print, rich text, lists, tables
- [~] Phase 2: Forced page breaks ✓, page state API ✓, table splitting ✓, paragraph splitting
- [ ] Phase 3: SVG, charts, math equations, table of contents
- [ ] Phase 4: Virtual scrolling (100+ pages), multi-column, PDF/DOCX export

## License

MIT
