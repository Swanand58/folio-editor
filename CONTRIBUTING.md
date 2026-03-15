# Contributing to Folio Editor

Thanks for your interest in contributing! This guide will help you get set up.

## Prerequisites

- **Node.js** 18+
- **npm** 9+

## Project Structure

```
folio-editor/
├── src/                  # Library source code
│   ├── core/             # TipTap extensions (FolioExtension, PageDocument, PageBreak)
│   ├── pagination/       # Pagination plugin (break detection, CSS injection, overlays)
│   ├── api/              # Public API (getPageInfo, scrollToPage, etc.)
│   ├── styles/           # Generated CSS for the editor
│   ├── layout/           # Page size presets, margin helpers, header/footer defaults
│   ├── print/            # Print utilities
│   ├── utils/            # Unit conversion helpers
│   └── types.ts          # Shared TypeScript interfaces
├── demo/                 # Next.js demo app (for testing, not published)
│   ├── app/              # Next.js app directory
│   └── components/       # FolioEditor + Toolbar
├── dist/                 # Built output (git-ignored)
├── package.json
├── tsconfig.json
└── tsup.config.ts        # Build configuration
```

## Getting Started

```bash
# Clone the repo
git clone https://github.com/Swanand58/folio-editor.git
cd folio-editor

# Install dependencies for the library
npm install

# Install dependencies for the demo app
cd demo && npm install && cd ..

# Build the library
npm run build

# Start the demo app
cd demo && npm run dev
```

The demo app runs at `http://localhost:3000` and imports `folio-editor` from the local build.

## Development Workflow

1. **Edit source** in `src/`
2. **Rebuild** with `npm run build` (or `npm run dev` for watch mode)
3. **Test visually** in the demo app — the Next.js dev server picks up changes automatically after rebuild
4. **Type-check** with `npm run typecheck`

## Making Changes

### Library code (`src/`)

The pagination architecture is CSS-based — it never dispatches ProseMirror transactions. If you're modifying the pagination logic, keep these invariants:

- `findBreaks()` is a pure function — it reads DOM measurements, never writes to the document
- `repaginate()` injects CSS via a `<style>` element in `<head>`, not inline styles on editor children
- Overlays (headers, footers, page numbers, gap bars) are rendered in sibling containers, never inside the editor DOM
- The `ResizeObserver` invalidates the doc cache to trigger re-pagination on layout changes

### Demo app (`demo/`)

The demo is intentionally simple — it exists to test the library, not to be a product. Keep it minimal.

## Pull Requests

1. Fork the repo and create a feature branch from `main`
2. Make your changes with clear, focused commits
3. Ensure `npm run build` and `npm run typecheck` pass
4. Open a PR with a description of what you changed and why

## Code Style

- TypeScript strict mode
- No comments that just narrate what code does — comments should explain *why*, not *what*
- Prefer small, focused functions over large ones

## Reporting Issues

Open an issue at [github.com/Swanand58/folio-editor/issues](https://github.com/Swanand58/folio-editor/issues) with:

- What you expected to happen
- What actually happened
- Steps to reproduce (or a minimal code snippet)
- Browser and OS version

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
