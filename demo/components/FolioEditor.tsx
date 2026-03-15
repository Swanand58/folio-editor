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
  <tr><td>Headers/Footers</td><td>Done</td><td>Static content on every page</td></tr>
  <tr><td>Print support</td><td>Done</td><td>Ctrl+P for print-ready output</td></tr>
  <tr><td>Copy/Paste</td><td>Done</td><td>Native clipboard support</td></tr>
  <tr><td>Forced breaks</td><td>Done</td><td>Cmd+Shift+Enter inserts page break</td></tr>
  <tr><td>Page state API</td><td>Done</td><td>getPageInfo, scrollToPage, events</td></tr>
  <tr><td>Table splitting</td><td>Done</td><td>Tables split at row boundaries across pages</td></tr>
  <tr><td>Header repetition</td><td>Done</td><td>Table headers repeat on continuation pages</td></tr>
  <tr><td>Paragraph split</td><td>Planned</td><td>Line-level breaks within paragraphs</td></tr>
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
<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
<p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
<p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
<p>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.</p>
<p>Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.</p>
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
          render: () => '<span style="color:#999;font-size:11px">Folio Editor — Document</span>',
        },
        footer: {
          enabled: false,
          height: 32,
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
      <div style={{ background: '#e8e8e8', minHeight: 'calc(100vh - 100px)', padding: '40px 0' }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
