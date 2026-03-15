import { Node } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    svgBlock: {
      insertSvg: (options: { src: string; width?: number; height?: number }) => ReturnType;
    };
  }
}

export const SvgBlock = Node.create<Record<string, never>, Record<string, never>>({
  name: 'svgBlock',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: '' },
      width: { default: null },
      height: { default: null },
    };
  },

  parseHTML() {
    return [{
      tag: 'div[data-svg-block]',
      getAttrs: (el) => {
        if (typeof el === 'string') return false;
        return {
          src: el.getAttribute('data-src') || el.innerHTML || '',
          width: el.getAttribute('data-width') ? Number(el.getAttribute('data-width')) : null,
          height: el.getAttribute('data-height') ? Number(el.getAttribute('data-height')) : null,
        };
      },
    }];
  },

  renderHTML({ node }) {
    return ['div', {
      'data-svg-block': '',
      'data-src': node.attrs.src,
      ...(node.attrs.width ? { 'data-width': String(node.attrs.width) } : {}),
      ...(node.attrs.height ? { 'data-height': String(node.attrs.height) } : {}),
      style: 'text-align:center;margin:16px 0;',
    }];
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement('div');
      dom.setAttribute('data-svg-block', '');
      Object.assign(dom.style, {
        textAlign: 'center',
        margin: '16px 0',
        cursor: 'default',
        borderRadius: '4px',
        transition: 'outline 0.15s',
      });
      dom.innerHTML = node.attrs.src;

      const svg = dom.querySelector('svg');
      if (svg) {
        if (node.attrs.width) svg.setAttribute('width', String(node.attrs.width));
        if (node.attrs.height) svg.setAttribute('height', String(node.attrs.height));
        svg.style.maxWidth = '100%';
        svg.style.height = 'auto';
        svg.style.pointerEvents = 'none';
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
      insertSvg: (options) => ({ commands }) => {
        return commands.insertContent({ type: this.name, attrs: options });
      },
    };
  },
});
