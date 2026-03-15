'use client';

import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { PageDocument, FolioExtension, PageBreak, getPageInfo, getVisiblePage } from 'folio-editor';
import { Toolbar } from './Toolbar';

const SAMPLE_CONTENT = `
<h1>Welcome to Folio Editor</h1>
<p>This is a paginated document editor. Content flows naturally and page breaks are rendered visually. Try typing, pasting content, or inserting a table.</p>

<h2>Features</h2>
<p><strong>Bold text</strong>, <em>italic text</em>, <u>underlined text</u>, and <s>strikethrough text</s> are all supported.</p>

<h2>Table Support</h2>
<table>
  <tr><th>Feature</th><th>Status</th><th>Notes</th></tr>
  <tr><td>Page breaks</td><td>Done</td><td>Visual page boundary markers</td></tr>
  <tr><td>Text formatting</td><td>Done</td><td>Bold, italic, underline, strike</td></tr>
  <tr><td>Headings</td><td>Done</td><td>H1 through H6</td></tr>
  <tr><td>Lists</td><td>Done</td><td>Ordered and unordered</td></tr>
  <tr><td>Tables</td><td>Done</td><td>With header rows and resize</td></tr>
  <tr><td>Page numbers</td><td>Done</td><td>Configurable position and format</td></tr>
  <tr><td>Headers/Footers</td><td>Done</td><td>Editable — click to type, syncs across pages</td></tr>
  <tr><td>Print support</td><td>Done</td><td>Ctrl+P for print-ready output</td></tr>
  <tr><td>Copy/Paste</td><td>Done</td><td>Native clipboard support</td></tr>
  <tr><td>Forced breaks</td><td>Done</td><td>Cmd+Shift+Enter inserts page break</td></tr>
  <tr><td>Page state API</td><td>Done</td><td>getPageInfo, scrollToPage, events</td></tr>
  <tr><td>Table splitting</td><td>Done</td><td>Tables split at row boundaries across pages</td></tr>
  <tr><td>Header repetition</td><td>Done</td><td>Table headers repeat on continuation pages</td></tr>
  <tr><td>Paragraph split</td><td>Done</td><td>Line-level breaks within paragraphs</td></tr>
  <tr><td>Custom themes</td><td>Planned</td><td>Theming API for page appearance</td></tr>
  <tr><td>Export PDF</td><td>Planned</td><td>Client-side PDF generation</td></tr>
  <tr><td>Collaboration</td><td>Planned</td><td>Real-time multi-user editing</td></tr>
  <tr><td>Comments</td><td>Planned</td><td>Inline annotations and discussions</td></tr>
  <tr><td>Track changes</td><td>Planned</td><td>Revision history with accept/reject</td></tr>
</table>

<h2>How It Works</h2>
<p>Content flows in a single continuous document. Page breaks are rendered visually as dashed lines between pages. Headers, footers, and page numbers are overlaid at the correct positions without interfering with the editor.</p>

<h3>Architecture</h3>
<p>Unlike approaches that split content into structural page nodes (which fight with ProseMirror's editing model), Folio Editor uses a CSS-based visualization with DOM overlays. This means:</p>
<ul>
  <li>Scrolling works perfectly — no DOM rebuilds</li>
  <li>Copy/paste works natively — no clipboard interception needed</li>
  <li>Undo/redo works correctly — no pagination transactions in history</li>
  <li>Selection works across page boundaries</li>
</ul>

<h2>Lists</h2>
<ul>
  <li>Bullet list item one</li>
  <li>Bullet list item two</li>
  <li>Bullet list item three with <strong>bold</strong> and <em>italic</em></li>
</ul>
<ol>
  <li>First ordered item</li>
  <li>Second ordered item</li>
  <li>Third ordered item</li>
</ol>

<h2>Print Support</h2>
<p>Click Print in the toolbar or press Ctrl+P. The CSS @page rules ensure each visual page maps to a printed page.</p>

<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>

<h2>Implementation Details</h2>
<p>The content-aware pagination engine works by measuring all top-level block children in the editor and finding the last block that fully fits within each page's content area. CSS margin-bottom is injected on that block to push subsequent content to the next page, creating real gaps aligned with block element boundaries.</p>
<p>Per-page card backgrounds with box shadows are rendered behind the editor content, while gap bars, headers, footers, and page numbers are overlaid at the correct positions. The CSS is injected via a style element in the document head rather than inline styles on editor children, so ProseMirror's MutationObserver is never triggered.</p>
<p>A ResizeObserver monitors the editor element for dimension changes caused by text reflow, window resizing, or content edits. Each repagination cycle clears the injected styles, forces a synchronous reflow to get clean measurements, then recalculates break points and re-injects the CSS.</p>
<p>The page state API exposes functions for programmatic access to page count, page positions, and the currently visible page. A custom DOM event is dispatched whenever pagination state changes, allowing React components to synchronize their UI without polling.</p>
<p>Forced page breaks are implemented as a custom TipTap node that renders with a data-page-break attribute. The break detection algorithm recognizes these nodes and always inserts a page break at their position, regardless of remaining space on the current page.</p>

<h2>Paragraph Splitting Demo</h2>
<p>The following paragraph is long enough to demonstrate paragraph splitting across page boundaries. When the paragraph crosses a page break, the fitting lines remain on the current page while the overflowing lines appear seamlessly at the top of the next page. This creates a natural reading experience identical to traditional word processors like Google Docs or Microsoft Word. The pagination engine measures individual line boxes using the browser's Range API and getClientRects method, finding the optimal split point at a line boundary. A visual clone of the remaining lines is rendered as an overlay at the top of the continuation page, while white masks hide any content bleeding into the margin and gap areas. The underlying document model stays as a single continuous document, preserving all of ProseMirror's editing capabilities including undo/redo, copy/paste, and cross-page text selection. Unlike approaches that split content into structural page nodes, this CSS-based approach avoids fighting with the editor's model. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.</p>
<p>Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.</p>
<p>Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.</p>
`;

export function FolioEditor() {
  const [pageStatus, setPageStatus] = useState('Page 1 of 1');

  const refreshPageStatus = useCallback((ed: any) => {
    const info = getPageInfo(ed);
    if (!info) return;
    const current = getVisiblePage(ed);
    setPageStatus(`Page ${current} of ${info.pageCount}`);
  }, []);

  const editor = useEditor({
    extensions: [
      PageDocument,
      FolioExtension.configure({
        pageSize: 'A4',
        margins: { top: 72, bottom: 72, left: 72, right: 72 },
        header: {
          enabled: true,
          height: 32,
          editable: true,
          render: () => 'Folio Editor — Document',
        },
        footer: {
          enabled: true,
          height: 32,
          editable: true,
        },
        pageNumber: {
          show: true,
          showTotal: true,
          showOnFirstPage: false,
          position: 'bottom',
          alignment: 'center',
        },
        pageGap: 40,
        pageBreakBackground: '#e8e8e8',
      }),
      PageBreak,
      StarterKit.configure({ document: false }),
      Underline,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: SAMPLE_CONTENT,
    autofocus: true,
    immediatelyRender: false,
    onSelectionUpdate: ({ editor: ed }) => refreshPageStatus(ed),
    onUpdate: ({ editor: ed }) => setTimeout(() => refreshPageStatus(ed), 50),
  });

  useEffect(() => {
    if (!editor) return;

    const dom = editor.view.dom;
    const onPageChange = () => refreshPageStatus(editor);
    dom.addEventListener('foliopagechange', onPageChange);

    const onScroll = () => refreshPageStatus(editor);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      dom.removeEventListener('foliopagechange', onPageChange);
      window.removeEventListener('scroll', onScroll);
    };
  }, [editor, refreshPageStatus]);

  return (
    <div>
      <Toolbar editor={editor} pageStatus={pageStatus} />
      <div style={{ background: '#e8e8e8', minHeight: 'calc(100vh - 100px)', padding: '40px 0', width: '100%' }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
