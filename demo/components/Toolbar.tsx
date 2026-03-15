'use client';

import type { Editor } from '@tiptap/core';

interface ToolbarProps {
  editor: Editor | null;
  pageStatus?: string;
}

export function Toolbar({ editor, pageStatus }: ToolbarProps) {
  if (!editor) return null;

  const btnStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '6px 10px',
    border: '1px solid #d0d0d0',
    borderRadius: '4px',
    background: isActive ? '#e8e8e8' : '#fff',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: isActive ? 600 : 400,
    minWidth: '32px',
  });

  const sep = (
    <div style={{ width: '1px', background: '#d0d0d0', margin: '0 4px' }} />
  );

  return (
    <div style={{
      padding: '8px 24px',
      borderBottom: '1px solid #e0e0e0',
      display: 'flex',
      gap: '4px',
      flexWrap: 'wrap',
      background: '#fafafa',
      position: 'sticky',
      top: '49px',
      zIndex: 99,
    }}>
      {/* Text formatting */}
      <button
        style={btnStyle(editor.isActive('bold'))}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </button>
      <button
        style={btnStyle(editor.isActive('italic'))}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (Ctrl+I)"
      >
        <em>I</em>
      </button>
      <button
        style={btnStyle(editor.isActive('underline'))}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline (Ctrl+U)"
      >
        <span style={{ textDecoration: 'underline' }}>U</span>
      </button>
      <button
        style={btnStyle(editor.isActive('strike'))}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Strikethrough"
      >
        <s>S</s>
      </button>

      {sep}

      {/* Headings */}
      {([1, 2, 3, 4] as const).map((level) => (
        <button
          key={level}
          style={btnStyle(editor.isActive('heading', { level }))}
          onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
          title={`Heading ${level}`}
        >
          H{level}
        </button>
      ))}

      {sep}

      {/* Lists */}
      <button
        style={btnStyle(editor.isActive('bulletList'))}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet List"
      >
        &#8226; List
      </button>
      <button
        style={btnStyle(editor.isActive('orderedList'))}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Ordered List"
      >
        1. List
      </button>

      {sep}

      {/* Table */}
      <button
        style={btnStyle(false)}
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 4, cols: 3, withHeaderRow: true })
            .run()
        }
        title="Insert Table"
      >
        Table
      </button>
      <button
        style={btnStyle(false)}
        onClick={() => editor.chain().focus().addColumnAfter().run()}
        disabled={!editor.can().addColumnAfter()}
        title="Add Column"
      >
        +Col
      </button>
      <button
        style={btnStyle(false)}
        onClick={() => editor.chain().focus().addRowAfter().run()}
        disabled={!editor.can().addRowAfter()}
        title="Add Row"
      >
        +Row
      </button>
      <button
        style={btnStyle(false)}
        onClick={() => editor.chain().focus().deleteColumn().run()}
        disabled={!editor.can().deleteColumn()}
        title="Delete Column"
      >
        -Col
      </button>
      <button
        style={btnStyle(false)}
        onClick={() => editor.chain().focus().deleteRow().run()}
        disabled={!editor.can().deleteRow()}
        title="Delete Row"
      >
        -Row
      </button>
      <button
        style={btnStyle(false)}
        onClick={() => editor.chain().focus().deleteTable().run()}
        disabled={!editor.can().deleteTable()}
        title="Delete Table"
      >
        Del Table
      </button>

      {sep}

      {/* Page Break */}
      <button
        style={btnStyle(false)}
        onClick={() => (editor as any).chain().focus().insertPageBreak().run()}
        title="Insert Page Break (Cmd+Shift+Enter)"
      >
        ⏎ Break
      </button>

      {sep}

      {/* Phase 3: Content blocks */}
      <button
        style={btnStyle(false)}
        onClick={() => (editor as any).chain().focus().insertTableOfContents().run()}
        title="Insert Table of Contents"
      >
        TOC
      </button>
      <button
        style={btnStyle(false)}
        onClick={() => (editor as any).chain().focus().insertChart({
          type: 'bar',
          labels: ['A', 'B', 'C', 'D'],
          values: [40, 80, 60, 90],
          title: 'Sample Chart',
        }).run()}
        title="Insert Bar Chart"
      >
        Chart
      </button>
      <button
        style={btnStyle(false)}
        onClick={() => {
          const latex = prompt('Enter LaTeX:', 'E = mc^2');
          if (latex) (editor as any).chain().focus().insertMathBlock({ latex }).run();
        }}
        title="Insert Math Equation"
      >
        Math
      </button>

      {sep}

      {/* Print */}
      <button
        style={btnStyle(false)}
        onClick={() => window.print()}
        title="Print (Ctrl+P)"
      >
        Print
      </button>

      {pageStatus && (
        <span style={{
          marginLeft: 'auto',
          fontSize: '12px',
          color: '#666',
          padding: '6px 10px',
          whiteSpace: 'nowrap',
        }}>
          {pageStatus}
        </span>
      )}
    </div>
  );
}
