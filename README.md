# folio-editor

A paginated document editor for React/Next.js. Automatic page breaks, table splitting, print-ready output. Built on [TipTap](https://tiptap.dev).

> **Status**: Early development — Phase 1 (MVP)

## Features

- Automatic page break detection and content redistribution
- Multiple page sizes: A4, A3, A5, US Letter, Legal, Tabloid
- Static headers and footers with page numbering
- Print-first: screen output matches `Ctrl+P` exactly
- Rich text: bold, italic, underline, strikethrough, headings (H1–H6)
- Lists, blockquotes, code blocks
- Table support with cross-page row splitting (Phase 2)
- Built as a TipTap extension — works with any TipTap setup

## Install

```bash
npm install folio-editor
```

## Quick Start

```tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  PageDocument,
  PageNode,
  FolioExtension,
  PageKeymap,
} from 'folio-editor';

function Editor() {
  const editor = useEditor({
    extensions: [
      PageDocument,
      PageNode,
      FolioExtension.configure({
        pageSize: 'A4',
        pageGap: 40,
      }),
      PageKeymap,
      // TipTap extensions (without Document — PageDocument replaces it)
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
  },
  footer: {
    enabled: true,
    height: 40,
  },
  pageNumber: {
    show: true,
    showTotal: true,
    showOnFirstPage: false,
    position: 'bottom',
    alignment: 'center',
  },
  pageGap: 40,
  pageBreakBackground: '#f0f0f0',
});
```

## Page Sizes

| Name    | Dimensions         |
|---------|--------------------|
| A3      | 297 × 420 mm      |
| A4      | 210 × 297 mm      |
| A5      | 148 × 210 mm      |
| Letter  | 8.5 × 11 in       |
| Legal   | 8.5 × 14 in       |
| Tabloid | 11 × 17 in        |

## Roadmap

- [x] Phase 1: Page layout, pagination, text formatting, print
- [ ] Phase 2: Lists, tables, table splitting, page numbers
- [ ] Phase 3: Images, SVG, charts, math equations, TOC
- [ ] Phase 4: Virtual scrolling (100+ pages), multi-column, export

## License

MIT
