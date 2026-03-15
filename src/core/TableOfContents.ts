import { Node } from '@tiptap/core';
import type { Editor } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tableOfContents: {
      insertTableOfContents: () => ReturnType;
    };
  }
}

interface TocEntry {
  level: number;
  text: string;
  index: number;
}

function extractHeadings(editor: Editor): TocEntry[] {
  const entries: TocEntry[] = [];
  editor.state.doc.descendants((node) => {
    if (node.type.name === 'heading') {
      entries.push({
        level: node.attrs.level,
        text: node.textContent,
        index: entries.length,
      });
    }
  });
  return entries;
}

export const TableOfContents = Node.create<Record<string, never>, Record<string, never>>({
  name: 'tableOfContents',
  group: 'block',
  atom: true,
  draggable: true,

  parseHTML() {
    return [{ tag: 'div[data-table-of-contents]' }];
  },

  renderHTML() {
    return ['div', { 'data-table-of-contents': '', style: 'margin:16px 0;padding:16px;' }];
  },

  addNodeView() {
    return ({ editor, getPos }) => {
      const dom = document.createElement('div');
      dom.setAttribute('data-table-of-contents', '');
      Object.assign(dom.style, {
        margin: '16px 0',
        padding: '20px 24px',
        background: '#f8f9fa',
        borderRadius: '6px',
        border: '1px solid #e8e8e8',
        cursor: 'default',
        transition: 'outline 0.15s',
      });

      dom.addEventListener('mousedown', (e) => {
        if ((e.target as HTMLElement).dataset.tocItem !== undefined) return;
        e.preventDefault();
        const pos = getPos();
        if (typeof pos === 'number') editor.commands.setNodeSelection(pos);
      });

      const renderToc = () => {
        const headings = extractHeadings(editor);
        dom.innerHTML = '';

        const title = document.createElement('div');
        title.textContent = 'Table of Contents';
        Object.assign(title.style, {
          fontWeight: '600',
          fontSize: '14px',
          marginBottom: '12px',
          color: '#333',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        });
        dom.appendChild(title);

        if (headings.length === 0) {
          const empty = document.createElement('div');
          empty.textContent = 'No headings found';
          Object.assign(empty.style, { color: '#999', fontStyle: 'italic', fontSize: '13px' });
          dom.appendChild(empty);
          return;
        }

        const list = document.createElement('div');
        for (const h of headings) {
          const item = document.createElement('div');
          Object.assign(item.style, {
            padding: '4px 0',
            paddingLeft: `${(h.level - 1) * 16}px`,
            fontSize: h.level === 1 ? '14px' : h.level === 2 ? '13px' : '12px',
            fontWeight: h.level <= 2 ? '500' : '400',
            color: '#4285f4',
            cursor: 'pointer',
            lineHeight: '1.6',
          });
          item.textContent = h.text;
          item.dataset.tocItem = '';
          item.addEventListener('mouseenter', () => { item.style.textDecoration = 'underline'; });
          item.addEventListener('mouseleave', () => { item.style.textDecoration = 'none'; });
          item.addEventListener('click', (e) => {
            e.preventDefault();
            const els = editor.view.dom.querySelectorAll('h1, h2, h3, h4, h5, h6');
            const target = els[h.index];
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          });
          list.appendChild(item);
        }
        dom.appendChild(list);
      };

      renderToc();

      let debounceId: ReturnType<typeof setTimeout> | null = null;
      const onUpdate = () => {
        if (debounceId !== null) clearTimeout(debounceId);
        debounceId = setTimeout(() => { debounceId = null; renderToc(); }, 150);
      };
      editor.on('update', onUpdate);

      return {
        dom,
        selectNode() { dom.style.outline = '2px solid #68CEF8'; dom.style.outlineOffset = '2px'; },
        deselectNode() { dom.style.outline = ''; dom.style.outlineOffset = ''; },
        destroy() {
          if (debounceId !== null) clearTimeout(debounceId);
          editor.off('update', onUpdate);
        },
      };
    };
  },

  addCommands() {
    return {
      insertTableOfContents: () => ({ commands }) => {
        return commands.insertContent({ type: this.name });
      },
    };
  },
});
