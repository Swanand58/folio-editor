'use client';

import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import {
  PageDocument, FolioExtension, PageBreak,
  SvgBlock, ChartBlock, MathBlock, TableOfContents,
  getPageInfo, getVisiblePage,
} from 'folio-editor';
import { Toolbar } from './Toolbar';

const SAMPLE_CONTENT = `
<h1>Welcome to Folio Editor</h1>

<div data-table-of-contents></div>

<p>This is a paginated document editor. Content flows naturally and page breaks are rendered visually. Try typing, pasting content, or inserting a table.</p>

<h2>Features</h2>
<p><strong>Bold text</strong>, <em>italic text</em>, <u>underlined text</u>, and <s>strikethrough text</s> are all supported.</p>

<h2>Table Support</h2>
<table>
  <tr><th>Feature</th><th>Status</th><th>Notes</th></tr>
  <tr><td>Page breaks</td><td>Done</td><td>Visual page boundary markers</td></tr>
  <tr><td>Text formatting</td><td>Done</td><td>Bold, italic, underline, strike</td></tr>
  <tr><td>Headings</td><td>Done</td><td>H1 through H6</td></tr>
  <tr><td>Tables</td><td>Done</td><td>With splitting and column resize</td></tr>
  <tr><td>Charts</td><td>Done</td><td>Bar, line, and pie charts (SVG)</td></tr>
  <tr><td>Math equations</td><td>Done</td><td>LaTeX rendering with custom renderer</td></tr>
  <tr><td>SVG graphics</td><td>Done</td><td>Embed raw SVG diagrams</td></tr>
  <tr><td>Table of contents</td><td>Done</td><td>Auto-generated, click to navigate</td></tr>
  <tr><td>Headers/Footers</td><td>Done</td><td>Editable — click to type, syncs across pages</td></tr>
  <tr><td>Paragraph split</td><td>Done</td><td>Line-level breaks within paragraphs</td></tr>
</table>

<h2>Charts</h2>
<p>Charts are rendered as pure SVG with no external dependencies. Bar, line, and pie charts are supported.</p>

<div data-chart-block data-config='{"type":"bar","labels":["Jan","Feb","Mar","Apr","May","Jun"],"values":[1200,1900,3000,2500,2800,3200],"title":"Monthly Website Visits"}'></div>

<div data-chart-block data-config='{"type":"line","labels":["Q1","Q2","Q3","Q4"],"values":[150,280,320,400],"title":"Quarterly Revenue ($K)"}'></div>

<div data-chart-block data-config='{"type":"pie","labels":["Chrome","Safari","Firefox","Edge","Other"],"values":[65,18,7,5,5],"title":"Browser Market Share"}'></div>

<h2>Math Equations</h2>
<p>Mathematical equations are rendered from LaTeX notation. Pass a custom <strong>renderMath</strong> function (e.g. KaTeX) for publication-quality output.</p>

<div data-math-block data-latex="E = mc^2"></div>

<div data-math-block data-latex="a^2 + b^2 = c^2"></div>

<div data-math-block data-latex="\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"></div>

<div data-math-block data-latex="\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}"></div>

<h2>SVG Graphics</h2>
<p>Raw SVG markup can be embedded directly into the document. The diagram below shows the editor architecture.</p>

<div data-svg-block><svg viewBox="0 0 420 120" xmlns="http://www.w3.org/2000/svg" style="font-family:-apple-system,sans-serif"><defs><marker id="arr" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0,10 3.5,0 7" fill="#666"/></marker></defs><rect x="10" y="35" width="110" height="50" rx="8" fill="#4285f4"/><text x="65" y="65" text-anchor="middle" fill="#fff" font-size="13">TipTap Editor</text><line x1="120" y1="60" x2="150" y2="60" stroke="#666" stroke-width="2" marker-end="url(#arr)"/><rect x="155" y="35" width="110" height="50" rx="8" fill="#34a853"/><text x="210" y="65" text-anchor="middle" fill="#fff" font-size="13">Pagination</text><line x1="265" y1="60" x2="295" y2="60" stroke="#666" stroke-width="2" marker-end="url(#arr)"/><rect x="300" y="35" width="110" height="50" rx="8" fill="#ea4335"/><text x="355" y="65" text-anchor="middle" fill="#fff" font-size="13">Page Output</text></svg></div>

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

<h2>Paragraph Splitting Demo</h2>
<p>The following paragraph is long enough to demonstrate paragraph splitting across page boundaries. When the paragraph crosses a page break, the fitting lines remain on the current page while the overflowing lines appear seamlessly at the top of the next page. This creates a natural reading experience identical to traditional word processors like Google Docs or Microsoft Word. The pagination engine measures individual line boxes using the browser's Range API and getClientRects method, finding the optimal split point at a line boundary. A visual clone of the remaining lines is rendered as an overlay at the top of the continuation page, while white masks hide any content bleeding into the margin and gap areas. The underlying document model stays as a single continuous document, preserving all of ProseMirror's editing capabilities including undo/redo, copy/paste, and cross-page text selection. Unlike approaches that split content into structural page nodes, this CSS-based approach avoids fighting with the editor's model.</p>
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
      SvgBlock,
      ChartBlock,
      MathBlock,
      TableOfContents,
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
