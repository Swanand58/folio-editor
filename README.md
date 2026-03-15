# folio-editor

[![npm version](https://img.shields.io/npm/v/folio-editor.svg)](https://www.npmjs.com/package/folio-editor)
[![license](https://img.shields.io/npm/l/folio-editor.svg)](https://github.com/Swanand58/folio-editor/blob/main/LICENSE)

A paginated document editor for React/Next.js — Google Docs-style page breaks, headers/footers, charts, math equations, and print-ready output. Built on [TipTap](https://tiptap.dev).

## Features

- **Content-aware page breaks** — breaks fall between block elements; long paragraphs split at line boundaries
- **Table splitting** — large tables split at row boundaries across pages
- **Paragraph splitting** — long paragraphs break mid-content with seamless continuation
- **Forced page breaks** — `PageBreak` node + `editor.commands.insertPageBreak()` (`Cmd+Shift+Enter`)
- **Page state API** — `getPageInfo()`, `getCurrentPage()`, `getVisiblePage()`, `scrollToPage()`
- **Multiple page sizes** — A4, A3, A5, US Letter, Legal, Tabloid, or custom
- **Editable headers and footers** — click to type; content syncs across all pages
- **Page numbers** — configurable position, alignment, format
- **Charts** — bar, line, and pie charts rendered as pure SVG (no dependencies)
- **Math equations** — LaTeX notation with pluggable renderer (KaTeX, MathJax, or fallback)
- **SVG graphics** — embed raw SVG diagrams
- **Table of contents** — auto-generated from headings, click to navigate
- **Print support** — `Ctrl+P` output matches screen layout
- **Rich text** — bold, italic, underline, strikethrough, headings H1–H6, lists, tables
- **Zero interference** — no ProseMirror transactions, native undo/redo and clipboard
- **Fully typed** — zero `any` in public API, JSDoc on every interface

## Install

```bash
npm install folio-editor
```

### Peer Dependencies

folio-editor requires TipTap as a peer dependency. Install it alongside:

```bash
npm install @tiptap/core @tiptap/pm @tiptap/react @tiptap/starter-kit
```

> **Note:** `@tiptap/react`, `react`, and `react-dom` are optional peers — the core library only depends on `@tiptap/core` and `@tiptap/pm`.

## Quick Start

```tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { PageDocument, FolioExtension, PageBreak } from 'folio-editor';

function Editor() {
  const editor = useEditor({
    extensions: [
      // PageDocument replaces StarterKit's built-in Document node
      // to support paginated block content
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
      // IMPORTANT: pass document: false so StarterKit doesn't
      // register its own Document node (conflicts with PageDocument)
      StarterKit.configure({ document: false }),
    ],
    content: '<p>Start typing...</p>',
  });

  return <EditorContent editor={editor} />;
}
```

### Next.js / SSR

folio-editor uses browser APIs (DOM, `ResizeObserver`, `requestAnimationFrame`) and **cannot run on the server**. In Next.js App Router, make sure the component that renders the editor is a client component:

```tsx
// app/editor/page.tsx
'use client';

import { Editor } from '../components/Editor'; // your editor component
export default function Page() {
  return <Editor />;
}
```

Or use `next/dynamic` with SSR disabled:

```tsx
import dynamic from 'next/dynamic';
const Editor = dynamic(() => import('../components/Editor'), { ssr: false });
```

### Why `document: false`?

`PageDocument` provides a custom document node (`content: 'block+'`) that the pagination engine relies on. StarterKit ships its own `Document` node — if both are registered, TipTap throws a duplicate node error. Passing `document: false` to StarterKit disables its version.

## Configuration

All options are optional — sensible defaults are applied.

```ts
FolioExtension.configure({
  // Page size: preset name or custom { name, width, height, unit }
  pageSize: 'A4', // 'A3' | 'A4' | 'A5' | 'LETTER' | 'LEGAL' | 'TABLOID'

  // Margins in pixels
  margins: { top: 72, bottom: 72, left: 72, right: 72 },

  // Header region
  header: {
    enabled: true,
    height: 40,              // pixels
    editable: true,          // Google Docs-style click-to-edit
    render: () => 'Header',  // initial HTML content
  },

  // Footer region
  footer: {
    enabled: true,
    height: 40,
    editable: true,
  },

  // Page numbers
  pageNumber: {
    show: true,
    showTotal: true,           // "1 / 3" vs "1"
    showOnFirstPage: false,
    position: 'bottom',        // 'top' | 'bottom'
    alignment: 'center',       // 'left' | 'center' | 'right'
    format: (current, total) => `Page ${current} of ${total}`,
  },

  pageGap: 40,                 // gap between pages (px)
  pageBreakBackground: '#e8e8e8',
});
```

## Content Block Extensions

Optional extensions for rich content. All are selectable (click to select, Delete to remove) and work with the pagination engine.

```tsx
import {
  SvgBlock,
  ChartBlock,
  MathBlock,
  TableOfContents,
} from 'folio-editor';

// Add to your extensions array alongside the core extensions:
const extensions = [
  PageDocument,
  FolioExtension.configure({ /* ... */ }),
  PageBreak,
  SvgBlock,
  ChartBlock,
  MathBlock,
  TableOfContents,
  StarterKit.configure({ document: false }),
];
```

### Commands

```ts
// Insert a bar, line, or pie chart (rendered as SVG, no external deps)
editor.commands.insertChart({
  type: 'bar',  // 'bar' | 'line' | 'pie'
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  values: [100, 200, 150, 300],
  title: 'Revenue',
  colors: ['#4285f4', '#ea4335', '#fbbc04', '#34a853'], // optional
});

// Insert a LaTeX math equation
editor.commands.insertMathBlock({ latex: 'E = mc^2' });

// Insert raw SVG
editor.commands.insertSvg({ src: '<svg>...</svg>', width: 400, height: 200 });

// Insert auto-generated table of contents
editor.commands.insertTableOfContents();
```

### MathBlock with KaTeX

The built-in fallback displays raw LaTeX in a styled block. For publication-quality rendering, pass a custom renderer:

```tsx
import katex from 'katex';
import 'katex/dist/katex.min.css';

MathBlock.configure({
  renderMath: (latex, displayMode) =>
    katex.renderToString(latex, { displayMode, throwOnError: false }),
});
```

## Page State API

```ts
import { getPageInfo, getActivePage, scrollToPage } from 'folio-editor';

// Get page layout data
const info = getPageInfo(editor);
// → { pageCount: 3, pages: [{ index: 0, top: 0, height: 1123 }, ...] }

// Which page is visible / has the cursor
getActivePage(editor, 'viewport');  // page most visible in viewport (default)
getActivePage(editor, 'cursor');    // page containing the text cursor

// Convenience aliases
getVisiblePage(editor);  // = getActivePage(editor, 'viewport')
getCurrentPage(editor);  // = getActivePage(editor, 'cursor')

// Scroll to a specific page (1-indexed)
scrollToPage(editor, 2);
```

### DOM Events

Listen for pagination and header/footer changes using exported constants:

```ts
import {
  FOLIO_PAGE_CHANGE,
  FOLIO_HEADER_CHANGE,
  FOLIO_FOOTER_CHANGE,
} from 'folio-editor';

editor.view.dom.addEventListener(FOLIO_PAGE_CHANGE, () => {
  console.log('Pages:', getPageInfo(editor));
});

editor.view.dom.addEventListener(FOLIO_HEADER_CHANGE, (e) => {
  console.log('Header:', (e as CustomEvent).detail.html);
});

editor.view.dom.addEventListener(FOLIO_FOOTER_CHANGE, (e) => {
  console.log('Footer:', (e as CustomEvent).detail.html);
});
```

## API Reference

### Extensions

| Export | Type | Description |
|--------|------|-------------|
| `PageDocument` | Node | Custom document node for paginated content |
| `FolioExtension` | Extension | Core pagination engine with all configuration |
| `PageBreak` | Node | Forced page break node (`Cmd+Shift+Enter`) |
| `SvgBlock` | Node | Embed raw SVG graphics |
| `ChartBlock` | Node | Bar, line, and pie charts (pure SVG) |
| `MathBlock` | Node | LaTeX equations with pluggable renderer |
| `TableOfContents` | Node | Auto-generated clickable heading list |

### Functions

| Export | Description |
|--------|-------------|
| `getPageInfo(editor)` | Returns `{ pageCount, pages[] }` layout data |
| `getCurrentPage(editor)` | 1-indexed page at cursor position |
| `getVisiblePage(editor)` | 1-indexed page most visible in viewport |
| `getActivePage(editor, mode)` | Unified API — `'cursor'` or `'viewport'` |
| `scrollToPage(editor, page)` | Smooth-scroll to a page (1-indexed) |
| `printDocument()` | Trigger browser print dialog |
| `generatePrintHTML(el, css)` | Generate standalone print HTML |
| `formatPageNumber(config, cur, total)` | Format a page number string |
| `getContentHeight(pageSize, margins, header, footer)` | Usable content height in px |
| `getContentWidth(pageSize, margins)` | Usable content width in px |
| `toPx(value, unit)` | Convert value to pixels |
| `fromPx(px, unit)` | Convert pixels to a unit |
| `convert(value, from, to)` | Convert between units |

### Constants

| Export | Value | Description |
|--------|-------|-------------|
| `FOLIO_PAGE_CHANGE` | `'foliopagechange'` | Fired after every repagination |
| `FOLIO_HEADER_CHANGE` | `'folioheaderchange'` | Fired when header is edited |
| `FOLIO_FOOTER_CHANGE` | `'foliofooterchange'` | Fired when footer is edited |
| `paginationPluginKey` | `PluginKey` | ProseMirror plugin key (advanced) |
| `PAGE_SIZES` | `Record<PageSizeName, PageSize>` | All preset page sizes |
| `DEFAULT_PAGE_SIZE` | `PageSize` | A4 |
| `DEFAULT_MARGINS` | `Margin` | 72px on all sides |
| `DEFAULT_HEADER` | `HeaderFooterConfig` | Disabled, 40px height |
| `DEFAULT_FOOTER` | `HeaderFooterConfig` | Disabled, 40px height |
| `DEFAULT_PAGE_NUMBER` | `PageNumberConfig` | Bottom center, show total |

### Types

| Export | Description |
|--------|-------------|
| `FolioConfig` | Full configuration object |
| `FolioExtensionOptions` | `DeepPartial<FolioConfig>` — all fields optional |
| `PageSize` | `{ name, width, height, unit }` |
| `PageSizeName` | `'A3' \| 'A4' \| 'A5' \| 'LETTER' \| 'LEGAL' \| 'TABLOID'` |
| `Margin` | `{ top, bottom, left, right }` in pixels |
| `HeaderFooterConfig` | `{ enabled, height, render?, editable? }` |
| `PageNumberConfig` | `{ show, showTotal, position, alignment, format? }` |
| `PageInfoData` | `{ pageCount, pages: PageInfoEntry[] }` |
| `PageInfoEntry` | `{ index, top, height }` |
| `Unit` | `'px' \| 'cm' \| 'in' \| 'mm' \| 'pt'` |
| `ChartConfig` | `{ type, labels, values, title?, colors? }` |
| `MathBlockOptions` | `{ renderMath? }` |

## Page Sizes

| Name | Dimensions |
|------|------------|
| A3 | 297 x 420 mm |
| A4 | 210 x 297 mm |
| A5 | 148 x 210 mm |
| Letter | 8.5 x 11 in |
| Legal | 8.5 x 14 in |
| Tabloid | 11 x 17 in |

## Troubleshooting

**"Duplicate node" error on startup**
You have two Document nodes registered. Pass `document: false` to StarterKit — see [Quick Start](#quick-start).

**Content renders on a single page with no breaks**
Make sure you're using `PageDocument` (not StarterKit's default Document) and that `FolioExtension` is in your extensions array.

**Page counter shows "Page 1 of 1" with lots of content**
The pagination engine runs after the first render. Listen for the `FOLIO_PAGE_CHANGE` event to update your UI, or use `getVisiblePage()` inside a scroll listener.

**Headers/footers are not editable**
Set `editable: true` in the header/footer config. The region must also have `enabled: true`.

## Roadmap

- [x] Phase 1: Page layout, pagination, headers/footers, page numbers, print, rich text, lists, tables
- [x] Phase 2: Forced page breaks, page state API, table splitting, paragraph splitting, editable headers/footers
- [x] Phase 3: SVG graphics, charts, math equations, table of contents
- [ ] Phase 4: Virtual scrolling (100+ pages), multi-column, PDF/DOCX export

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.

## License

MIT
