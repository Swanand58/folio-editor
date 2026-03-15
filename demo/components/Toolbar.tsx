'use client';

import type { Editor } from '@tiptap/core';

interface ToolbarProps {
  editor: Editor | null;
}

export function Toolbar({ editor }: ToolbarProps) {
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
      <button
        style={btnStyle(editor.isActive('bold'))}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold"
      >
        <strong>B</strong>
      </button>
      <button
        style={btnStyle(editor.isActive('italic'))}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic"
      >
        <em>I</em>
      </button>
      <button
        style={btnStyle(editor.isActive('underline'))}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline"
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

      <div style={{ width: '1px', background: '#d0d0d0', margin: '0 4px' }} />

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

      <div style={{ width: '1px', background: '#d0d0d0', margin: '0 4px' }} />

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

      <div style={{ width: '1px', background: '#d0d0d0', margin: '0 4px' }} />

      <button
        style={btnStyle(false)}
        onClick={() => window.print()}
        title="Print"
      >
        Print
      </button>
    </div>
  );
}
