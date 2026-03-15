'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import {
  PageDocument,
  PageNode,
  FolioExtension,
  PageKeymap,
} from 'folio-editor';
import { Toolbar } from './Toolbar';

const SAMPLE_CONTENT = `
<h1>Welcome to Folio Editor</h1>
<p>This is a paginated document editor. Content automatically flows across pages with proper page breaks. Try typing enough content to fill a page and watch it spill onto the next one.</p>

<h2>Features</h2>
<p>Folio Editor provides automatic pagination with proper page dimensions, margins, and print support. Each page you see on screen corresponds exactly to what will be printed.</p>
<p><strong>Bold text</strong>, <em>italic text</em>, <u>underlined text</u>, and <s>strikethrough text</s> are all supported out of the box.</p>

<h2>Table Support</h2>
<p>Tables are fully supported with header rows, cell editing, and column/row management. Use the toolbar buttons to insert and modify tables.</p>

<table>
  <tr><th>Feature</th><th>Status</th><th>Notes</th></tr>
  <tr><td>Page breaks</td><td>Done</td><td>Automatic content redistribution</td></tr>
  <tr><td>Text formatting</td><td>Done</td><td>Bold, italic, underline, strike</td></tr>
  <tr><td>Headings</td><td>Done</td><td>H1 through H6</td></tr>
  <tr><td>Lists</td><td>Done</td><td>Ordered and unordered</td></tr>
  <tr><td>Tables</td><td>Done</td><td>With header rows</td></tr>
  <tr><td>Table splitting</td><td>Done</td><td>Split across pages at row boundaries</td></tr>
  <tr><td>Page numbers</td><td>Done</td><td>Configurable position and format</td></tr>
  <tr><td>Headers/Footers</td><td>Done</td><td>Static content on every page</td></tr>
  <tr><td>Print support</td><td>Done</td><td>Screen matches print output</td></tr>
  <tr><td>Images</td><td>Phase 3</td><td>Inline and block images</td></tr>
  <tr><td>Charts</td><td>Phase 3</td><td>SVG-based charts</td></tr>
  <tr><td>Math equations</td><td>Phase 3</td><td>KaTeX integration</td></tr>
</table>

<h2>How Page Breaks Work</h2>
<p>As you type or paste content, the pagination engine measures the rendered height of content within each page. When content exceeds the available space (accounting for margins, headers, and footers), it automatically moves the overflowing blocks to the next page.</p>
<p>This happens in real-time as you edit, so the document always shows an accurate page layout.</p>

<h3>Technical Details</h3>
<p>The pagination engine uses DOM measurement to determine exactly how much content fits on each page. Unlike CSS-based approaches (used by even the paid TipTap Pages extension), this allows us to split content at precise block boundaries and split tables at row boundaries with header repetition.</p>

<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

<h2>Lists</h2>
<ul>
  <li>Bullet list item one</li>
  <li>Bullet list item two</li>
  <li>Bullet list item three with <strong>bold</strong> and <em>italic</em></li>
</ul>
<ol>
  <li>Ordered item one</li>
  <li>Ordered item two</li>
  <li>Ordered item three</li>
</ol>

<h2>Print Support</h2>
<p>Click the Print button in the toolbar or press Ctrl+P to print. The print output matches the on-screen layout exactly — each page div becomes one printed page with matching dimensions and margins.</p>
<p>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.</p>
<p>Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.</p>
<p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
<p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
`;

export function FolioEditor() {
  const editor = useEditor({
    extensions: [
      PageDocument,
      PageNode,
      FolioExtension.configure({
        pageSize: 'A4',
        margins: { top: 72, bottom: 72, left: 72, right: 72 },
        header: {
          enabled: true,
          height: 40,
          render: () => '<span style="color: #999; font-size: 11px;">Folio Editor — Document</span>',
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
        pageBreakBackground: '#e8e8e8',
      }),
      PageKeymap,
      StarterKit.configure({
        document: false,
      }),
      Underline,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: SAMPLE_CONTENT,
    autofocus: true,
    immediatelyRender: false,
  });

  return (
    <div>
      <Toolbar editor={editor} />
      <div style={{ background: '#e8e8e8', minHeight: 'calc(100vh - 100px)' }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
