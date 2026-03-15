# folio-editor

A paginated document editor for React/Next.js. Automatic page breaks, headers/footers, page numbers, print-ready output. Built on [TipTap](https://tiptap.dev).

> **Status**: Phase 3 complete — Phase 4 planned

## Features

- **Content-aware page breaks** — breaks fall between block elements; long paragraphs split at line boundaries
- **Table splitting** — large tables split at row boundaries across pages with clean closing borders
- **Paragraph splitting** — long paragraphs break mid-content with continuation rendered on the next page
- **Forced page breaks** — `PageBreak` node + `editor.commands.insertPageBreak()` (keyboard: `Cmd+Shift+Enter`)
- **Page state API** — `getPageInfo()`, `getCurrentPage()`, `getVisiblePage()`, `scrollToPage()`
- **Multiple page sizes**: A4, A3, A5, US Letter, Legal, Tabloid
- **Editable headers and footers** — click to type; content syncs across all pages (Google Docs style)
- **Page numbers** — configurable position, alignment, format
- **Charts** — bar, line, and pie charts rendered as pure SVG (no dependencies)
- **Math equations** — LaTeX notation with pluggable renderer (KaTeX, MathJax, or built-in fallback)
- **SVG graphics** — embed raw SVG diagrams directly in the document
- **Table of contents** — auto-generated from headings, click to navigate
- **Print support** — `Ctrl+P` output matches screen layout
- **Rich text**: bold, italic, underline, strikethrough, headings H1–H6
- **Lists**: ordered and unordered
- **Tables** with column resize
- **Zero interference** — no ProseMirror transactions, no clipboard interception, native undo/redo
- **Fully typed** — zero `any` in public API, JSDoc on every interface

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
          editable: true,
          render: () => 'My Document',
        },
        pageNumber: {
          show: true,
          position: 'bottom',
          alignment: 'center',
        },
      }),
      PageBreak,
      StarterKit.configure({ document: false }),
    ],
    content: '<p>Start typing...</p>',
  });

  return <EditorContent editor={editor} />;
}
```

## Content Block Extensions

All block extensions are selectable (click to select, Delete to remove) and work with the pagination engine.

```tsx
import {
  SvgBlock,        // embed raw SVG
  ChartBlock,      // bar / line / pie charts
  MathBlock,       // LaTeX equations
  TableOfContents, // auto-generated heading list
} from 'folio-editor';

// Add to your extensions array:
const extensions = [
  // ...core extensions...
  SvgBlock,
  ChartBlock,
  MathBlock,
  TableOfContents,
];

// Insert via commands:
editor.commands.insertChart({
  type: 'bar',
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  values: [100, 200, 150, 300],
  title: 'Revenue',
});

editor.commands.insertMathBlock({ latex: 'E = mc^2' });
editor.commands.insertSvg({ src: '<svg>...</svg>' });
editor.commands.insertTableOfContents();
```

### MathBlock with KaTeX

Pass a custom renderer for publication-quality math:

```tsx
import katex from 'katex';

MathBlock.configure({
  renderMath: (latex, displayMode) =>
    katex.renderToString(latex, { displayMode, throwOnError: false }),
});
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
    editable: true,              // click to type (Google Docs style)
    render: () => 'Header text', // initial content (optional with editable)
  },
  footer: {
    enabled: true,
    height: 40,
    editable: true,
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

### DOM Events

Use the exported constants instead of raw strings:

```ts
import {
  FOLIO_PAGE_CHANGE,
  FOLIO_HEADER_CHANGE,
  FOLIO_FOOTER_CHANGE,
} from 'folio-editor';

editor.view.dom.addEventListener(FOLIO_PAGE_CHANGE, () => {
  console.log('Pages changed:', getPageInfo(editor));
});

editor.view.dom.addEventListener(FOLIO_HEADER_CHANGE, (e) => {
  console.log('Header updated:', (e as CustomEvent).detail.html);
});

editor.view.dom.addEventListener(FOLIO_FOOTER_CHANGE, (e) => {
  console.log('Footer updated:', (e as CustomEvent).detail.html);
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
- [x] Phase 2: Forced page breaks, page state API, table splitting, paragraph splitting, editable headers/footers
- [x] Phase 3: SVG graphics, charts, math equations, table of contents
- [ ] Phase 4: Virtual scrolling (100+ pages), multi-column, PDF/DOCX export

## License

MIT
