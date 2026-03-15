'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
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
<h2>How Page Breaks Work</h2>
<p>As you type or paste content, the pagination engine measures the rendered height of content within each page. When content exceeds the available space (accounting for margins, headers, and footers), it automatically moves the overflowing blocks to the next page.</p>
<p>This happens in real-time as you edit, so the document always shows an accurate page layout.</p>
<h3>Technical Details</h3>
<p>The pagination engine uses DOM measurement to determine exactly how much content fits on each page. Unlike CSS-based approaches, this allows us to split content at precise block boundaries and will eventually support table row splitting across pages.</p>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
<p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
<p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
<h2>Print Support</h2>
<p>Click the Print button in the toolbar or press Ctrl+P to print. The print output matches the on-screen layout exactly — each page div becomes one printed page with matching dimensions and margins.</p>
<p>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.</p>
<p>Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.</p>
`;

export function FolioEditor() {
  const editor = useEditor({
    extensions: [
      PageDocument,
      PageNode,
      FolioExtension.configure({
        pageSize: 'A4',
        margins: { top: 72, bottom: 72, left: 72, right: 72 },
        header: { enabled: false, height: 40 },
        footer: { enabled: false, height: 40 },
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
    ],
    content: SAMPLE_CONTENT,
    autofocus: true,
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
