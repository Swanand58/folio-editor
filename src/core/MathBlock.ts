import { Node } from '@tiptap/core';

export interface MathBlockOptions {
  renderMath?: (latex: string, displayMode: boolean) => string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mathBlock: {
      insertMathBlock: (options: { latex: string }) => ReturnType;
    };
  }
}

export const MathBlock = Node.create<MathBlockOptions, Record<string, never>>({
  name: 'mathBlock',
  group: 'block',
  atom: true,
  draggable: true,

  addOptions() {
    return { renderMath: undefined };
  },

  addAttributes() {
    return {
      latex: { default: '' },
    };
  },

  parseHTML() {
    return [{
      tag: 'div[data-math-block]',
      getAttrs: (el) => {
        if (typeof el === 'string') return false;
        return { latex: el.getAttribute('data-latex') || el.textContent || '' };
      },
    }];
  },

  renderHTML({ node }) {
    return ['div', {
      'data-math-block': '',
      'data-latex': node.attrs.latex,
      style: 'text-align:center;margin:16px 0;padding:12px;',
    }];
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement('div');
      dom.setAttribute('data-math-block', '');
      Object.assign(dom.style, {
        textAlign: 'center',
        margin: '16px 0',
        padding: '12px',
        fontSize: '1.2em',
        cursor: 'default',
        borderRadius: '4px',
        transition: 'outline 0.15s',
      });

      const latex = node.attrs.latex;
      if (this.options.renderMath) {
        try {
          dom.innerHTML = this.options.renderMath(latex, true);
        } catch {
          renderFallback(dom, latex);
        }
      } else {
        renderFallback(dom, latex);
      }

      dom.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const pos = getPos();
        if (typeof pos === 'number') editor.commands.setNodeSelection(pos);
      });

      return {
        dom,
        selectNode() { dom.style.outline = '2px solid #68CEF8'; dom.style.outlineOffset = '2px'; },
        deselectNode() { dom.style.outline = ''; dom.style.outlineOffset = ''; },
      };
    };
  },

  addCommands() {
    return {
      insertMathBlock: (options) => ({ commands }) => {
        return commands.insertContent({ type: this.name, attrs: options });
      },
    };
  },
});

function renderFallback(dom: HTMLElement, latex: string) {
  Object.assign(dom.style, {
    fontFamily: '"Cambria Math", "Latin Modern Math", "STIX Two Math", Georgia, serif',
    background: '#f8f9fa',
    borderRadius: '4px',
    border: '1px solid #e8e8e8',
  });
  dom.textContent = latex;
}
