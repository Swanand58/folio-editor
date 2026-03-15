# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] — 2026-03-15

### Added
- **SVG graphics** — `SvgBlock` extension for embedding raw SVG diagrams
- **Charts** — `ChartBlock` extension with bar, line, and pie chart types rendered as pure SVG
- **Math equations** — `MathBlock` extension with LaTeX notation and pluggable renderer (KaTeX, MathJax, or built-in fallback)
- **Table of contents** — `TableOfContents` extension, auto-generated from headings with click-to-navigate
- Click-to-select and Delete support for all atom nodes (charts, math, SVG, TOC)
- Toolbar buttons for inserting charts, math equations, and table of contents in the demo

### Changed
- **Zero `any` in public API** — all TipTap generics, plugin keys, and internal caches use proper types
- Replaced DOM property cache (`__folioPageInfo`) with `WeakMap` for type safety
- `PluginKey` typed as `PluginKey<null>` instead of `PluginKey<any>`
- `toPx()`, `fromPx()`, `convert()` now accept `Unit` type instead of `string`
- Removed unused `SvgBlockOptions.HTMLAttributes` interface
- Added `PageSizeName` union type (`'A3' | 'A4' | 'A5' | 'LETTER' | 'LEGAL' | 'TABLOID'`) for autocomplete
- Added `sideEffects: false` to `package.json` for better tree-shaking
- Added `peerDependenciesMeta` — `@tiptap/react`, `react`, `react-dom` marked optional
- Exported `FOLIO_PAGE_CHANGE`, `FOLIO_HEADER_CHANGE`, `FOLIO_FOOTER_CHANGE` event name constants
- JSDoc comments on all public types (Margin, PageSize, FolioConfig, etc.)
- `DeepPartial` marked `@internal` and removed from public exports

## [0.2.0] — 2026-03-15

### Added
- **Forced page breaks** — `PageBreak` node extension with `insertPageBreak` command and `Cmd+Shift+Enter` keyboard shortcut
- **Page state API** — `getPageInfo()`, `getCurrentPage()`, `getVisiblePage()`, `getActivePage()`, `scrollToPage()`
- **Table splitting across pages** — tables that exceed a page boundary are split at row boundaries instead of being pushed entirely to the next page
- **Paragraph splitting across pages** — long paragraphs break at line boundaries with continuation displayed on the next page via clone overlays
- **Editable headers and footers** — click to type directly in header/footer areas; content syncs across all pages in real time. `folioheaderchange` and `foliofooterchange` DOM events fire on edit.
- `foliopagechange` custom DOM event fired on the editor element after every repagination
- Page break CSS for print media (`break-after: page`)
- White margin masks and closing border line for clean table break visuals
- Sub-pixel clipping strips for artifact-free paragraph continuation rendering

### Changed
- `findBreaks` now detects `data-page-break` elements and forces page boundaries
- `findBreaks` now walks table rows to find intra-table split points when a table overflows a page
- `findBreaks` now measures individual lines within paragraphs to find intra-paragraph split points
- Table cell borders no longer bleed into the page gap area

## [0.1.0] — 2026-03-15

### Added
- Content-aware pagination via CSS margin injection (no ProseMirror transactions)
- `FolioExtension` — main TipTap extension with full configuration
- `PageDocument` — custom document node for block content
- Multiple page sizes: A4, A3, A5, US Letter, Legal, Tabloid
- Configurable margins (top, bottom, left, right)
- Headers and footers with custom `render()` functions
- Page numbers with configurable position, alignment, format, and first-page visibility
- Print support via CSS `@page` rules
- Per-page card backgrounds with box shadow
- Gap bars between pages
- `ResizeObserver`-based re-pagination on editor resize
- Typography styles: headings H1–H6, bold, italic, underline, strikethrough
- Lists: ordered and unordered
- Tables with column resize
- `printDocument()` and `generatePrintHTML()` utilities
- Unit conversion helpers: `toPx()`, `fromPx()`, `convert()`
- Layout presets: `PAGE_SIZES`, `DEFAULT_PAGE_SIZE`, `DEFAULT_MARGINS`
- Header/footer defaults: `DEFAULT_HEADER`, `DEFAULT_FOOTER`, `DEFAULT_PAGE_NUMBER`
- Full TypeScript type exports

[Unreleased]: https://github.com/Swanand58/folio-editor/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/Swanand58/folio-editor/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/Swanand58/folio-editor/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Swanand58/folio-editor/releases/tag/v0.1.0
